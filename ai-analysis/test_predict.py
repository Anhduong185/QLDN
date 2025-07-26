"""
Script test API dự đoán nguy cơ nghỉ việc
"""

import requests
import json

# URL của API
BASE_URL = "http://localhost:5000"

def test_health():
    """Test endpoint health check"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_model_info():
    """Test endpoint model info"""
    print("\n🔍 Testing model info...")
    try:
        response = requests.get(f"{BASE_URL}/model_info")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_single_predict():
    """Test dự đoán đơn lẻ"""
    print("\n🔍 Testing single prediction...")
    
    # Dữ liệu mẫu cho một nhân viên
    sample_employee = {
        "so_ngay_di_lam": 220,
        "so_lan_di_muon": 5,
        "so_lan_ve_som": 3,
        "gio_lam_viec_tb": 8.5,
        "tong_ngay_nghi_phep": 12,
        "so_don_nghi_phep": 3,
        "so_nam_lam_viec": 2.5,
        "phong_ban_encoded": 1,
        "chuc_vu_encoded": 2,
        "tuoi": 28
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=sample_employee,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Dự đoán thành công!")
            print(f"  - Prediction: {result['prediction']}")
            print(f"  - Probability: {result['probability']:.3f}")
            print(f"  - Risk Level: {result['risk_level']}")
            print(f"  - Timestamp: {result['timestamp']}")
        else:
            print(f"❌ Lỗi: {response.json()}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_batch_predict():
    """Test dự đoán hàng loạt"""
    print("\n🔍 Testing batch prediction...")
    
    # Dữ liệu mẫu cho nhiều nhân viên
    sample_employees = {
        "employees": [
            {
                "so_ngay_di_lam": 250,
                "so_lan_di_muon": 2,
                "so_lan_ve_som": 1,
                "gio_lam_viec_tb": 8.0,
                "tong_ngay_nghi_phep": 8,
                "so_don_nghi_phep": 2,
                "so_nam_lam_viec": 3.0,
                "phong_ban_encoded": 0,
                "chuc_vu_encoded": 1,
                "tuoi": 30
            },
            {
                "so_ngay_di_lam": 180,
                "so_lan_di_muon": 25,
                "so_lan_ve_som": 20,
                "gio_lam_viec_tb": 7.5,
                "tong_ngay_nghi_phep": 15,
                "so_don_nghi_phep": 5,
                "so_nam_lam_viec": 1.0,
                "phong_ban_encoded": 2,
                "chuc_vu_encoded": 0,
                "tuoi": 25
            },
            {
                "so_ngay_di_lam": 200,
                "so_lan_di_muon": 10,
                "so_lan_ve_som": 8,
                "gio_lam_viec_tb": 8.2,
                "tong_ngay_nghi_phep": 10,
                "so_don_nghi_phep": 3,
                "so_nam_lam_viec": 2.0,
                "phong_ban_encoded": 1,
                "chuc_vu_encoded": 1,
                "tuoi": 27
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict_batch",
            json=sample_employees,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Dự đoán hàng loạt thành công!")
            print(f"  - Total processed: {result['total_processed']}")
            
            for i, employee_result in enumerate(result['results']):
                if 'error' in employee_result:
                    print(f"  - Employee {i}: ❌ {employee_result['error']}")
                else:
                    print(f"  - Employee {i}: ✅ {employee_result['risk_level']} risk "
                          f"(prob: {employee_result['probability']:.3f})")
        else:
            print(f"❌ Lỗi: {response.json()}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_invalid_data():
    """Test với dữ liệu không hợp lệ"""
    print("\n🔍 Testing invalid data...")
    
    # Dữ liệu thiếu trường
    invalid_data = {
        "so_ngay_di_lam": 220,
        "so_lan_di_muon": 5
        # Thiếu các trường khác
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=invalid_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 400:
            result = response.json()
            print("✅ Xử lý lỗi đúng cách!")
            print(f"  - Error: {result['error']}")
            print(f"  - Required fields: {result['required_fields']}")
        else:
            print(f"❌ Không xử lý lỗi như mong đợi: {response.json()}")
        
        return response.status_code == 400
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def main():
    """Chạy tất cả các test"""
    print("🧪 Bắt đầu test API dự đoán...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("Model Info", test_model_info),
        ("Single Prediction", test_single_predict),
        ("Batch Prediction", test_batch_predict),
        ("Invalid Data", test_invalid_data)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        try:
            success = test_func()
            results.append((test_name, success))
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{status}: {test_name}")
        except Exception as e:
            print(f"❌ ERROR: {test_name} - {e}")
            results.append((test_name, False))
    
    # Tổng kết
    print("\n" + "=" * 50)
    print("📊 KẾT QUẢ TEST:")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print(f"\n🎯 Tổng kết: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Tất cả tests đều thành công!")
    else:
        print("⚠️ Một số tests thất bại. Hãy kiểm tra lại!")

if __name__ == "__main__":
    main() 