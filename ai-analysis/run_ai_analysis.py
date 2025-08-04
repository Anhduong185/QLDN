#!/usr/bin/env python3
"""
AI Analysis Runner - Chạy toàn bộ hệ thống AI phân tích nhân sự
"""

import os
import sys
import subprocess
import time

def run_command(command, description):
    """Chạy lệnh và hiển thị kết quả"""
    print(f"\n{'='*50}")
    print(f"🔄 {description}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(f"⚠️ Warnings/Errors: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def main():
    """Chạy toàn bộ quy trình AI analysis"""
    print("🤖 AI Phân Tích Dữ Liệu Nhân Sự")
    print("="*50)
    
    # Đường dẫn đến các script
    script_dir = os.path.join(os.path.dirname(__file__), 'src')
    
    # Bước 1: Xử lý dữ liệu
    print("\n📊 BƯỚC 1: Xử lý dữ liệu")
    success = run_command(
        f"python {os.path.join(script_dir, 'process_data.py')}",
        "Xử lý dữ liệu chấm công, nghỉ phép và nhân viên"
    )
    
    if not success:
        print("❌ Lỗi khi xử lý dữ liệu. Dừng quy trình.")
        return
    
    # Bước 2: Huấn luyện model
    print("\n🎯 BƯỚC 2: Huấn luyện model AI")
    success = run_command(
        f"python {os.path.join(script_dir, 'train_model.py')}",
        "Huấn luyện model dự đoán nguy cơ nghỉ việc"
    )
    
    if not success:
        print("❌ Lỗi khi huấn luyện model. Dừng quy trình.")
        return
    
    # Bước 3: Khởi động API
    print("\n🚀 BƯỚC 3: Khởi động Flask API")
    print("💡 API sẽ chạy tại: http://localhost:5000")
    print("💡 Để dừng API, nhấn Ctrl+C")
    
    api_script = os.path.join(script_dir, 'predict_api.py')
    
    try:
        # Chạy API trong background
        process = subprocess.Popen(
            f"python {api_script}",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print("✅ API đã khởi động thành công!")
        print("\n📋 Các endpoint có sẵn:")
        print("   - GET  /health      - Kiểm tra trạng thái API")
        print("   - POST /predict     - Dự đoán cho 1 nhân viên")
        print("   - POST /predict_batch - Dự đoán cho nhiều nhân viên")
        print("   - GET  /model_info  - Thông tin model")
        print("   - GET  /trends      - Xu hướng dự đoán")
        
        print("\n🔄 API đang chạy... (Nhấn Ctrl+C để dừng)")
        
        # Chờ process kết thúc
        process.wait()
        
    except KeyboardInterrupt:
        print("\n⏹️ Dừng API...")
        if 'process' in locals():
            process.terminate()
        print("✅ Đã dừng API")
    except Exception as e:
        print(f"❌ Lỗi khi chạy API: {e}")

if __name__ == "__main__":
    main() 