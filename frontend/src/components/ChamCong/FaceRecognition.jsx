import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { chamCongService } from '../../services/chamCongService';

const FaceRecognition = ({ onRegisterFace, onCheckIn, mode, selectedEmployee, disabled = false }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const intervalRef = useRef(null);
  const modeRef = useRef(mode);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [identifiedEmployee, setIdentifiedEmployee] = useState(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    loadModels();
    return () => {
      stopVideo();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + '/tiny_face_detector'),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + '/face_landmark_68'),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + '/face_recognition'),
      ]);
      setIsModelLoaded(true);
      startVideo();
    } catch (error) {
      console.error('❌ Lỗi khi tải mô hình:', error);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('❌ Không thể truy cập camera:', error);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const convertErrorMessage = (raw) => {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed?.message?.includes('đã được đăng ký')) {
        const match = parsed.message.match(/nhân viên: (.+)/);
        const name = match?.[1] || 'người khác';
        return `Khuôn mặt này đã được đăng ký cho nhân viên "${name}". Vui lòng thử lại với người khác.`;
      }
      if (parsed?.message?.includes('Không tìm thấy nhân viên phù hợp')) {
        return 'Không nhận diện được khuôn mặt phù hợp. Vui lòng thử lại.';
      }
      return parsed?.message || 'Đã xảy ra lỗi không xác định.';
    } catch {
      // fallback khi không parse được
      if (typeof raw === 'string' && raw.includes('đã được đăng ký')) {
        const match = raw.match(/nhân viên: (.+)/);
        const name = match?.[1] || 'người khác';
        return `Khuôn mặt này đã được đăng ký cho nhân viên "${name}".`;
      }
      return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  };

  const handleVideoPlay = () => {
    if (!isModelLoaded || disabled) return;
    if (!videoRef.current || videoRef.current.readyState < 2) return; // Đảm bảo video đã sẵn sàng

    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(canvas);

    const displaySize = {
      width: videoRef.current.width,
      height: videoRef.current.height
    };
    faceapi.matchDimensions(canvas, displaySize);

    const detectFaces = async () => {
      if (!videoRef.current || disabled || isProcessing) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      if (detections.length > 0) {
        setFaceDetected(true);
        
        // Nhận diện khuôn mặt ngay khi phát hiện
        if (modeRef.current === 'checkin' && !identifiedEmployee && !isProcessing) {
          const faceDescriptor = detections[0].descriptor;
          try {
            const result = await chamCongService.identifyFace({ face_descriptor: Array.from(faceDescriptor) });
            if (result.success && result.data.identified) {
              setIdentifiedEmployee(result.data.nhan_vien);
            }
          } catch (error) {
            console.error('❌ Lỗi nhận diện khuôn mặt:', error);
          }
        }

        setIsProcessing(true);

        setScanningProgress(prev => {
          const newProgress = Math.min(prev + 25, 100);

          if (newProgress >= 100 && prev < 100) {
            const faceDescriptor = detections[0].descriptor;

            setTimeout(async () => {
              try {
                setErrorMsg('');
                if (modeRef.current === 'register') {
                  await onRegisterFace?.(faceDescriptor);
                } else {
                  await onCheckIn?.(faceDescriptor);
                }
              } catch (error) {
                console.error('❌ Lỗi xử lý khuôn mặt:', error);
                const rawMsg = error?.message || error?.response?.data || 'Lỗi không xác định.';
                const userFriendlyMsg = convertErrorMessage(rawMsg);
                setErrorMsg(userFriendlyMsg);
              } finally {
                setIsProcessing(false);
                setScanningProgress(0);
              }
            }, 500);
          } else {
            setIsProcessing(false);
          }

          return newProgress;
        });
      } else {
        setFaceDetected(false);
        setIdentifiedEmployee(null);
        setScanningProgress(0);
        setIsProcessing(false);
      }
    };

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(detectFaces, 1000);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: 640,
        height: 480,
        background: '#fff',
        borderRadius: 20,
        border: `3px solid ${faceDetected ? '#28a745' : '#dc3545'}`,
        overflow: 'hidden',
        margin: '0 auto',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <video
        ref={videoRef}
        width="640"
        height="480"
        autoPlay
        muted
        onPlay={handleVideoPlay}
        style={{
          borderRadius: '20px',
          width: '640px',
          height: '480px',
          objectFit: 'cover',
          background: '#fff',
          display: 'block'
        }}
      />
      <div
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '640px',
          height: '480px',
          pointerEvents: 'none'
        }}
      />

      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        {!isModelLoaded ? '⏳ Đang tải mô hình...' :
         disabled ? '⏸️ Tạm dừng' :
         faceDetected ? '✅ Đã phát hiện khuôn mặt' : '❌ Không phát hiện'}
      </div>

      {identifiedEmployee && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(40, 167, 69, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          maxWidth: '200px',
          textAlign: 'center'
        }}>
          👤 {identifiedEmployee.ten}
          <br />
          <span style={{ fontSize: '12px', opacity: 0.9 }}>
            {identifiedEmployee.ma_nhan_vien}
          </span>
          {identifiedEmployee.confidence && (
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              Độ tin cậy: {identifiedEmployee.confidence}%
            </div>
          )}
        </div>
      )}

      {scanningProgress > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: '10px',
          padding: '5px'
        }}>
          <div style={{
            width: `${scanningProgress}%`,
            height: '10px',
            backgroundColor: '#28a745',
            borderRadius: '5px',
            transition: 'width 0.3s ease'
          }} />
          <div style={{
            color: 'white',
            textAlign: 'center',
            fontSize: '12px',
            marginTop: '2px'
          }}>
            {mode === 'register' ? 'Đang đăng ký...' : 'Đang nhận diện...'} {scanningProgress}%
          </div>
        </div>
      )}

      {errorMsg && (
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '10px',
          right: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '13px',
          textAlign: 'center'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
