import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AiDashboard = () => {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [employeePrediction, setEmployeePrediction] = useState(null);
  const [trends, setTrends] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [modelVersion, setModelVersion] = useState(1);
  const [autoUpdate, setAutoUpdate] = useState(false);

  useEffect(() => {
    loadAiStats();
    loadBatchPredictions();
    loadTrends();
    
    // Auto-refresh every 5 minutes if enabled
    if (autoUpdate) {
      const interval = setInterval(() => {
        loadAiStats();
        loadBatchPredictions();
        loadTrends();
      }, 300000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [autoUpdate]);

  const loadAiStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/ai-analysis/stats');
      if (response.data.success) {
        setStats(response.data.data);
        setModelVersion(response.data.data.model_info?.version || 1);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBatchPredictions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/ai-analysis/predict-batch-attrition');
      console.log('Batch predictions response:', response.data);
      if (response.data.success) {
        setPredictions(response.data.data.predictions || []);
      } else {
        console.error('API trả về success: false:', response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi tải dự đoán hàng loạt:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrends = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/ai-analysis/analyze-trends');
      if (response.data.success) {
        setTrends(response.data.data);
        setAnomalies(response.data.data.anomalies || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải xu hướng:', error);
    }
  };

  const updateModel = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/ai-analysis/update-model');
      if (response.data.success) {
        alert('✅ Cập nhật model AI thành công!');
        loadAiStats(); // Reload stats
      } else {
        // Kiểm tra thông báo lỗi có phải "Không có dữ liệu mới"
        if (response.data.message && response.data.message.includes('Không có dữ liệu mới')) {
          alert('⚠️ Không có dữ liệu mới để cập nhật model.');
        } else {
          alert('❌ Lỗi cập nhật model: ' + response.data.message);
        }
      }
    } catch (error) {
      // Nếu lỗi từ backend trả về message "Không có dữ liệu mới"
      const msg = error?.response?.data?.message || '';
      if (msg.includes('Không có dữ liệu mới')) {
        alert('⚠️ Không có dữ liệu mới để cập nhật model.');
      } else {
        alert('❌ Lỗi cập nhật model AI');
      }
      console.error('Lỗi cập nhật model:', error);
    } finally {
      setLoading(false);
    }
  };

  const predictEmployee = async (employeeId) => {
    try {
      const response = await axios.post('http://localhost:8000/api/ai-analysis/predict-attrition', {
        nhan_vien_id: employeeId
      });
      if (response.data.success) {
        setEmployeePrediction(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi dự đoán nhân viên:', error);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Cao': return '#dc3545';
      case 'Trung bình': return '#ffc107';
      case 'Thấp': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'Cao': return '🔴';
      case 'Trung bình': return '🟡';
      case 'Thấp': return '🟢';
      default: return '⚪';
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#007bff' }}>
        🤖 AI Phân Tích Nhân Sự Thông Minh
      </h2>

      {/* Control Panel */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={loadAiStats}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            🔄 Refresh
          </button>
          
          <button
            onClick={updateModel}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            🧠 Cập Nhật Model
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
            Auto-refresh (5 phút)
          </label>
          
          <span style={{ 
            padding: '4px 8px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            Model v{modelVersion}
          </span>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      {stats && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ color: '#495057', marginBottom: '15px' }}>📊 Thống Kê Tổng Quan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: '#28a745', margin: '0' }}>{stats.employee_stats.total}</h4>
              <p style={{ margin: '5px 0', color: '#6c757d' }}>Tổng nhân viên</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: '#007bff', margin: '0' }}>{stats.employee_stats.active}</h4>
              <p style={{ margin: '5px 0', color: '#6c757d' }}>Đang làm việc</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: '#dc3545', margin: '0' }}>{stats.employee_stats.left}</h4>
              <p style={{ margin: '5px 0', color: '#6c757d' }}>Đã nghỉ việc</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: '#ffc107', margin: '0' }}>{stats.employee_stats.attrition_rate}%</h4>
              <p style={{ margin: '5px 0', color: '#6c757d' }}>Tỷ lệ nghỉ việc</p>
            </div>
          </div>
        </div>
      )}

      {/* Xu hướng và cảnh báo */}
      {trends && (
        <div style={{
          backgroundColor: '#fff3cd',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '1px solid #ffeaa7'
        }}>
          <h3 style={{ color: '#856404', marginBottom: '15px' }}>📈 Phân Tích Xu Hướng</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Xu hướng chấm công */}
            <div>
              <h4 style={{ color: '#856404', marginBottom: '10px' }}>
                {getTrendIcon(trends.attendance_trends?.trend_direction)} Chấm Công
              </h4>
              <p>Đi muộn TB: {trends.attendance_trends?.avg_late_minutes?.toFixed(1)} phút</p>
              <p>Về sớm TB: {trends.attendance_trends?.avg_early_minutes?.toFixed(1)} phút</p>
              <p>Xu hướng: {trends.attendance_trends?.trend_direction}</p>
            </div>

            {/* Xu hướng nghỉ phép */}
            <div>
              <h4 style={{ color: '#856404', marginBottom: '10px' }}>
                {getTrendIcon(trends.leave_trends?.trend_direction)} Nghỉ Phép
              </h4>
              <p>Tổng ngày nghỉ: {trends.leave_trends?.total_leave_days}</p>
              <p>TB/ngày: {trends.leave_trends?.avg_leaves_per_day?.toFixed(1)}</p>
              <p>Xu hướng: {trends.leave_trends?.trend_direction}</p>
            </div>
          </div>

          {/* Cảnh báo bất thường */}
          {anomalies.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#dc3545', marginBottom: '10px' }}>⚠️ Cảnh Báo Bất Thường</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                {anomalies.map((anomaly, index) => (
                  <div key={index} style={{
                    backgroundColor: '#f8d7da',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #f5c6cb'
                  }}>
                    <strong>{anomaly.employee_name}</strong>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>{anomaly.description}</p>
                    <small style={{ color: '#721c24' }}>
                      Tỷ lệ cũ: {anomaly.data.previous_rate}% → Mới: {anomaly.data.current_rate}%
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dự đoán hàng loạt */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#495057', margin: '0' }}>🎯 Dự Đoán Nguy Cơ Nghỉ Việc</h3>
          <button
            onClick={loadBatchPredictions}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Đang tải...' : '🔄 Cập nhật'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
          {predictions.length > 0 ? (
            predictions.map((prediction, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '10px',
                  border: `2px solid ${getRiskColor(prediction.risk_level)}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                onClick={() => predictEmployee(prediction.nhan_vien.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: '0', color: '#495057' }}>
                    {prediction.nhan_vien.ten}
                  </h4>
                  <span style={{ fontSize: '24px' }}>
                    {getRiskIcon(prediction.risk_level)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: getRiskColor(prediction.risk_level), 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {prediction.risk_level}
                  </span>
                  <span style={{ color: '#6c757d', fontSize: '14px' }}>
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </div>
                
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#6c757d' }}>
                  ID: {prediction.nhan_vien.ma_nhan_vien}
                </p>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
              border: '2px dashed #dee2e6'
            }}>
              <p style={{ fontSize: '16px', color: '#6c757d', margin: '0' }}>
                {loading ? '⏳ Đang tải dữ liệu dự đoán...' : '📋 Chưa có dữ liệu dự đoán. Hãy bấm "Cập nhật" để tải.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chi tiết dự đoán nhân viên */}
      {employeePrediction && (
        <div style={{
          backgroundColor: '#e7f3ff',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '1px solid #b3d9ff'
        }}>
          <h3 style={{ color: '#004085', marginBottom: '15px' }}>
            📋 Chi Tiết Dự Đoán: {employeePrediction.nhan_vien.ten}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#004085', marginBottom: '10px' }}>Kết Quả Dự Đoán</h4>
              <p><strong>Nguy cơ:</strong> {employeePrediction.risk_level}</p>
              <p><strong>Xác suất:</strong> {(employeePrediction.probability * 100).toFixed(1)}%</p>
              <p><strong>Dự đoán:</strong> {employeePrediction.prediction === 1 ? 'Có nguy cơ' : 'Không có nguy cơ'}</p>
            </div>
            
            <div>
              <h4 style={{ color: '#004085', marginBottom: '10px' }}>Features</h4>
              <p><strong>Số ngày đi làm:</strong> {employeePrediction.features.so_ngay_di_lam}</p>
              <p><strong>Số lần đi muộn:</strong> {employeePrediction.features.so_lan_di_muon}</p>
              <p><strong>Số lần về sớm:</strong> {employeePrediction.features.so_lan_ve_som}</p>
              <p><strong>Giờ làm TB:</strong> {employeePrediction.features.gio_lam_viec_tb}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiDashboard; 