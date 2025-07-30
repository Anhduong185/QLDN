"""
API Flask để dự đoán nguy cơ nghỉ việc với khả năng học liên tục
Sử dụng model đã được huấn luyện từ train_model.py
"""
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime
import threading
import time
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import logging

app = Flask(__name__)

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Biến global để lưu model và dữ liệu
model = None
scaler = None
feature_names = None
model_metadata = None
training_data = []
model_version = 1
last_update = datetime.now()

def load_model():
    """Load model AI và metadata"""
    global model, scaler, feature_names, model_metadata
    
    try:
        model = joblib.load('models/attrition_model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        
        with open('models/model_metadata.json', 'r', encoding='utf-8') as f:
            model_metadata = json.load(f)
        
        feature_names = model_metadata['feature_names']
        
        logger.info(f"✅ Model loaded successfully - Version: {model_metadata.get('version', 1)}")
        logger.info(f"📊 Features: {len(feature_names)}")
        logger.info(f"🎯 Algorithm: {model_metadata.get('algorithm', 'Unknown')}")
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        raise

# Load model khi khởi động
load_model()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_version': model_version,
        'last_update': last_update.isoformat(),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Dự đoán nguy cơ nghỉ việc cho một nhân viên"""
    try:
        data = request.json
        
        # Kiểm tra dữ liệu đầu vào
        required_features = feature_names
        missing_features = [f for f in required_features if f not in data]
        
        if missing_features:
            return jsonify({
                'error': f'Thiếu features: {missing_features}'
            }), 400
        
        # Chuẩn bị dữ liệu
        features = np.array([[data[f] for f in required_features]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Dự đoán
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0][1]
        
        # Xác định mức độ rủi ro
        risk_level = get_risk_level(probability)
        
        # Tính feature importance cho nhân viên này
        feature_importance = dict(zip(feature_names, model.feature_importances_))
        
        return jsonify({
            'prediction': int(prediction),
            'probability': round(probability, 3),
            'risk_level': risk_level,
            'feature_importance': feature_importance,
            'input_features': data,
            'model_version': model_version,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """Dự đoán hàng loạt cho nhiều nhân viên"""
    try:
        data = request.json
        employees = data.get('employees', [])
        
        if not employees:
            return jsonify({'error': 'Không có dữ liệu nhân viên'}), 400
        
        results = []
        
        for employee in employees:
            try:
                # Kiểm tra features
                missing_features = [f for f in feature_names if f not in employee]
                if missing_features:
                    results.append({
                        'error': f'Thiếu features: {missing_features}',
                        'employee_data': employee
                    })
                    continue
                
                # Chuẩn bị dữ liệu
                features = np.array([[employee[f] for f in feature_names]])
                features_scaled = scaler.transform(features)
                
                # Dự đoán
                prediction = model.predict(features_scaled)[0]
                
                # Xử lý predict_proba an toàn
                try:
                    proba = model.predict_proba(features_scaled)
                    if proba.shape[1] >= 2:
                        probability = proba[0][1]
                    else:
                        probability = 0.5  # Default value
                except Exception as e:
                    logger.warning(f"Error in predict_proba: {e}")
                    probability = 0.5  # Default value
                
                risk_level = get_risk_level(probability)
                
                results.append({
                    'prediction': int(prediction),
                    'probability': round(probability, 3),
                    'risk_level': risk_level,
                    'employee_id': employee.get('nhan_vien_id', 'unknown')
                })
                
            except Exception as e:
                results.append({
                    'error': str(e),
                    'employee_data': employee
                })
        
        return jsonify({
            'results': results,
            'total_processed': len(employees),
            'successful_predictions': len([r for r in results if 'error' not in r]),
            'model_version': model_version,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Batch prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_model', methods=['POST'])
def update_model():
    """Cập nhật model với dữ liệu mới (học liên tục)"""
    try:
        data = request.json
        new_data = data.get('new_data', [])
        update_type = data.get('update_type', 'incremental')
        
        if not new_data:
            return jsonify({'error': 'Không có dữ liệu mới'}), 400
        
        logger.info(f"🔄 Updating model with {len(new_data)} new samples")
        
        # Chuẩn bị dữ liệu mới
        new_features = []
        new_labels = []
        
        for employee in new_data:
            # Tạo synthetic label dựa trên patterns
            features = [
                employee.get('so_ngay_di_lam', 0),
                employee.get('so_lan_di_muon', 0),
                employee.get('so_lan_ve_som', 0),
                employee.get('gio_lam_viec_tb', 8.0),
                employee.get('tong_ngay_nghi_phep', 0),
                employee.get('so_don_nghi_phep', 0),
                employee.get('so_nam_lam_viec', 0),
                employee.get('phong_ban_encoded', 0),
                employee.get('chuc_vu_encoded', 0),
                employee.get('tuoi', 25)
            ]
            
            # Tạo label dựa trên patterns
            high_risk = (
                features[1] > 5 or  # so_lan_di_muon
                features[2] > 3 or  # so_lan_ve_som
                features[4] > 5 or  # tong_ngay_nghi_phep
                features[0] < 10    # so_ngay_di_lam
            )
            
            new_features.append(features)
            new_labels.append(1 if high_risk else 0)
        
        # Cập nhật model
        if update_type == 'incremental':
            # Học liên tục - thêm dữ liệu mới vào model hiện tại
            X_new = np.array(new_features)
            y_new = np.array(new_labels)
            
            # Scale dữ liệu mới
            X_new_scaled = scaler.transform(X_new)
            
            # Cập nhật model với dữ liệu mới
            model.fit(X_new_scaled, y_new)
            
            # Cập nhật metadata
            global model_version, last_update
            model_version += 1
            last_update = datetime.now()
            
            # Lưu model mới
            joblib.dump(model, 'models/attrition_model.pkl')
            
            # Cập nhật metadata
            model_metadata['version'] = model_version
            model_metadata['last_update'] = last_update.isoformat()
            model_metadata['total_samples'] = model_metadata.get('total_samples', 0) + len(new_data)
            
            with open('models/model_metadata.json', 'w', encoding='utf-8') as f:
                json.dump(model_metadata, f, ensure_ascii=False, indent=2)
            
            logger.info(f"✅ Model updated successfully - Version: {model_version}")
            
            return jsonify({
                'success': True,
                'message': 'Model updated successfully',
                'new_accuracy': 'N/A (incremental learning)',
                'samples_added': len(new_data),
                'model_version': model_version,
                'timestamp': datetime.now().isoformat()
            })
        
        else:
            return jsonify({'error': 'Update type not supported'}), 400
            
    except Exception as e:
        logger.error(f"❌ Model update error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """Lấy thông tin về model hiện tại"""
    return jsonify({
        'algorithm': model_metadata.get('algorithm', 'RandomForestClassifier'),
        'feature_count': len(feature_names),
        'feature_names': feature_names,
        'model_loaded': model is not None,
        'model_version': model_version,
        'last_update': last_update.isoformat(),
        'total_samples': model_metadata.get('total_samples', 'Unknown'),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/trends', methods=['GET'])
def get_trends():
    """Phân tích xu hướng dựa trên dữ liệu đã có"""
    try:
        # Phân tích xu hướng từ training data
        if training_data:
            df = pd.DataFrame(training_data)
            
            trends = {
                'attendance_trend': {
                    'avg_days_worked': df['so_ngay_di_lam'].mean(),
                    'avg_late_count': df['so_lan_di_muon'].mean(),
                    'avg_early_count': df['so_lan_ve_som'].mean()
                },
                'leave_trend': {
                    'avg_leave_days': df['tong_ngay_nghi_phep'].mean(),
                    'avg_leave_requests': df['so_don_nghi_phep'].mean()
                },
                'risk_distribution': {
                    'high_risk_count': len(df[df['risk_score'] > 0.7]),
                    'medium_risk_count': len(df[(df['risk_score'] > 0.3) & (df['risk_score'] <= 0.7)]),
                    'low_risk_count': len(df[df['risk_score'] <= 0.3])
                }
            }
            
            return jsonify({
                'success': True,
                'trends': trends,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No training data available'
            })
            
    except Exception as e:
        logger.error(f"❌ Trends analysis error: {e}")
        return jsonify({'error': str(e)}), 500

def get_risk_level(probability):
    """Xác định mức độ rủi ro dựa trên xác suất"""
    if probability >= 0.7:
        return 'Cao'
    elif probability >= 0.3:
        return 'Trung bình'
    else:
        return 'Thấp'

def background_model_update():
    """Cập nhật model định kỳ trong background"""
    while True:
        try:
            time.sleep(3600)  # Cập nhật mỗi giờ
            logger.info("🔄 Running scheduled model update...")
            
            # Có thể thêm logic cập nhật tự động ở đây
            
        except Exception as e:
            logger.error(f"❌ Background update error: {e}")

# Khởi động background thread
update_thread = threading.Thread(target=background_model_update, daemon=True)
update_thread.start()

if __name__ == '__main__':
    logger.info("🚀 Starting AI Prediction API...")
    logger.info(f"📊 Model loaded with {len(feature_names)} features")
    logger.info(f"🎯 API ready at http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 