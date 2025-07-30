#!/usr/bin/env python3
"""
Test script để kiểm tra API AI
"""

import requests
import json
import time

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get('http://localhost:5000/health')
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed")
            print(f"   Model loaded: {data.get('model_loaded', False)}")
            print(f"   Model version: {data.get('model_version', 'Unknown')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Không thể kết nối đến API. Hãy đảm bảo API đang chạy.")
        return False

def test_single_prediction():
    """Test dự đoán cho 1 nhân viên"""
    sample_data = {
        "so_ngay_di_lam": 15,
        "so_lan_di_muon": 2,
        "so_lan_ve_som": 1,
        "gio_lam_viec_tb": 8.5,
        "tong_ngay_nghi_phep": 3,
        "so_don_nghi_phep": 2,
        "so_nam_lam_viec": 3,
        "phong_ban_encoded": 1,
        "chuc_vu_encoded": 1,
        "tuoi": 32
    }
    
    try:
        response = requests.post(
            'http://localhost:5000/predict',
            json=sample_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Single prediction test passed")
            print(f"   Prediction: {data.get('prediction', 'Unknown')}")
            print(f"   Probability: {data.get('probability', 0):.3f}")
            print(f"   Risk level: {data.get('risk_level', 'Unknown')}")
            return True
        else:
            print(f"❌ Single prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error in single prediction test: {e}")
        return False

def test_batch_prediction():
    """Test dự đoán cho nhiều nhân viên"""
    sample_batch = [
        {
            "id": 1,
            "so_ngay_di_lam": 20,
            "so_lan_di_muon": 0,
            "so_lan_ve_som": 0,
            "gio_lam_viec_tb": 8.0,
            "tong_ngay_nghi_phep": 1,
            "so_don_nghi_phep": 1,
            "so_nam_lam_viec": 5,
            "phong_ban_encoded": 0,
            "chuc_vu_encoded": 0,
            "tuoi": 30
        },
        {
            "id": 2,
            "so_ngay_di_lam": 10,
            "so_lan_di_muon": 5,
            "so_lan_ve_som": 3,
            "gio_lam_viec_tb": 7.5,
            "tong_ngay_nghi_phep": 8,
            "so_don_nghi_phep": 4,
            "so_nam_lam_viec": 2,
            "phong_ban_encoded": 1,
            "chuc_vu_encoded": 1,
            "tuoi": 28
        }
    ]
    
    try:
        response = requests.post(
            'http://localhost:5000/predict_batch',
            json={"employees": sample_batch},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Batch prediction test passed")
            print(f"   Predictions: {len(data.get('predictions', []))}")
            for pred in data.get('predictions', []):
                print(f"   Employee {pred.get('id')}: {pred.get('risk_level')} ({pred.get('probability', 0):.3f})")
            return True
        else:
            print(f"❌ Batch prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error in batch prediction test: {e}")
        return False

def test_model_info():
    """Test lấy thông tin model"""
    try:
        response = requests.get('http://localhost:5000/model_info')
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Model info test passed")
            print(f"   Algorithm: {data.get('algorithm', 'Unknown')}")
            print(f"   Features: {len(data.get('feature_names', []))}")
            print(f"   Accuracy: {data.get('accuracy', 0):.3f}")
            return True
        else:
            print(f"❌ Model info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error in model info test: {e}")
        return False

def main():
    """Chạy tất cả tests"""
    print("🧪 Testing AI API")
    print("="*50)
    
    # Đợi API khởi động
    print("⏳ Đợi API khởi động...")
    time.sleep(3)
    
    tests = [
        ("Health Check", test_health),
        ("Single Prediction", test_single_prediction),
        ("Batch Prediction", test_batch_prediction),
        ("Model Info", test_model_info)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print(f"\n📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 Tất cả tests đều thành công!")
    else:
        print("⚠️ Một số tests thất bại. Hãy kiểm tra lại API.")

if __name__ == "__main__":
    main() 