"""
Xử lý dữ liệu nhân sự, chấm công, nghỉ phép
Chuẩn bị dữ liệu cho việc huấn luyện model AI
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def load_data():
    """Đọc dữ liệu từ các file CSV"""
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up one level to ai-analysis directory, then into data
    data_dir = os.path.join(os.path.dirname(script_dir), 'data')
    
    # Đọc dữ liệu nhân viên
    df_nv = pd.read_csv(f'{data_dir}/nhan_vien.csv')
    print(f"✅ Đã đọc {len(df_nv)} nhân viên")
    
    # Đọc dữ liệu chấm công
    df_cc = pd.read_csv(f'{data_dir}/cham_cong.csv')
    print(f"✅ Đã đọc {len(df_cc)} bản ghi chấm công")
    
    # Đọc dữ liệu nghỉ phép
    df_np = pd.read_csv(f'{data_dir}/don_nghi_phep.csv')
    print(f"✅ Đã đọc {len(df_np)} đơn nghỉ phép")
    
    return df_nv, df_cc, df_np

def process_attendance_data(df_cc):
    """Xử lý dữ liệu chấm công"""
    # Chuyển đổi kiểu dữ liệu ngày tháng
    df_cc['ngay'] = pd.to_datetime(df_cc['ngay'])
    
    # Tổng hợp theo nhân viên
    attendance_summary = df_cc.groupby('nhan_vien_id').agg({
        'ngay': 'count',  # Số ngày đi làm
        'phut_tre': lambda x: (x > 0).sum(),  # Số lần đi muộn
        'phut_som': lambda x: (x > 0).sum(),  # Số lần về sớm
        'gio_lam_thuc_te': 'mean'  # Giờ làm việc trung bình
    }).rename(columns={
        'ngay': 'so_ngay_di_lam',
        'phut_tre': 'so_lan_di_muon',
        'phut_som': 'so_lan_ve_som',
        'gio_lam_thuc_te': 'gio_lam_viec_tb'
    })
    
    return attendance_summary

def process_leave_data(df_np):
    """Xử lý dữ liệu nghỉ phép"""
    # Chuyển đổi kiểu dữ liệu ngày tháng
    df_np['ngay_nghi'] = pd.to_datetime(df_np['ngay_nghi'])
    
    # Tổng hợp theo nhân viên
    leave_summary = df_np.groupby('nhan_vien_id').agg({
        'id': 'count'  # Số đơn nghỉ phép
    }).rename(columns={
        'id': 'so_don_nghi_phep'
    })
    
    # Tính tổng ngày nghỉ phép (chỉ những đơn đã duyệt)
    approved_leaves = df_np[df_np['trang_thai'] == 'da_duyet'].groupby('nhan_vien_id').size()
    leave_summary['tong_ngay_nghi_phep'] = approved_leaves
    
    return leave_summary.fillna(0)

def process_employee_data(df_nv):
    """Xử lý dữ liệu nhân viên"""
    # Chuyển đổi kiểu dữ liệu ngày tháng
    df_nv['ngay_sinh'] = pd.to_datetime(df_nv['ngay_sinh'])
    
    # Tính tuổi
    current_date = pd.Timestamp.now()
    df_nv['tuoi'] = (current_date - df_nv['ngay_sinh']).dt.days / 365.25
    
    # Tính số năm làm việc (giả sử dựa trên tuổi)
    df_nv['so_nam_lam_viec'] = df_nv['tuoi'] - 22  # Giả sử bắt đầu làm việc từ 22 tuổi
    df_nv['so_nam_lam_viec'] = df_nv['so_nam_lam_viec'].clip(lower=0)  # Không âm
    
    # Mã hóa các trường phân loại
    df_nv['phong_ban_encoded'] = df_nv['phong_ban_id'].astype('category').cat.codes
    df_nv['chuc_vu_encoded'] = df_nv['chuc_vu_id'].astype('category').cat.codes
    
    return df_nv

def combine_data(df_nv, attendance_summary, leave_summary):
    """Kết hợp tất cả dữ liệu"""
    # Gộp dữ liệu chấm công
    df_combined = df_nv.set_index('id').join(attendance_summary, how='left')
    
    # Gộp dữ liệu nghỉ phép
    df_combined = df_combined.join(leave_summary, how='left')
    
    # Điền giá trị thiếu bằng 0
    df_combined = df_combined.fillna(0)
    
    return df_combined

def create_features(df_combined):
    """Tạo các feature cho model AI"""
    features = [
        'so_ngay_di_lam',
        'so_lan_di_muon', 
        'so_lan_ve_som',
        'gio_lam_viec_tb',
        'tong_ngay_nghi_phep',
        'so_don_nghi_phep',
        'so_nam_lam_viec',
        'phong_ban_encoded',
        'chuc_vu_encoded',
        'tuoi'
    ]
    
    # Chọn các cột cần thiết
    df_features = df_combined[features].copy()
    
    # Thêm label (giả sử có cột 'nghi_viec')
    if 'nghi_viec' in df_combined.columns:
        df_features['nghi_viec'] = df_combined['nghi_viec']
    
    return df_features

def main():
    """Hàm chính xử lý dữ liệu"""
    print("Bắt đầu xử lý dữ liệu...")
    
    try:
        # Đọc dữ liệu
        df_nv, df_cc, df_np = load_data()
        
        # Xử lý từng loại dữ liệu
        print("Xử lý dữ liệu chấm công...")
        attendance_summary = process_attendance_data(df_cc)
        
        print("Xử lý dữ liệu nghỉ phép...")
        leave_summary = process_leave_data(df_np)
        
        print("Xử lý dữ liệu nhân viên...")
        df_nv_processed = process_employee_data(df_nv)
        
        # Kết hợp dữ liệu
        print("Kết hợp dữ liệu...")
        df_combined = combine_data(df_nv_processed, attendance_summary, leave_summary)
        
        # Tạo features
        print("Tạo features cho model...")
        df_features = create_features(df_combined)
        
        # Lưu kết quả
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(os.path.dirname(script_dir), 'data')
        output_path = os.path.join(data_dir, 'nhan_su_processed.csv')
        df_features.to_csv(output_path, index=True)
        
        print(f"✅ Đã lưu dữ liệu đã xử lý vào: {output_path}")
        print(f"📈 Tổng số nhân viên: {len(df_features)}")
        print(f"🎯 Số features: {len(df_features.columns) - 1}")  # Trừ cột label
        
        # Hiển thị thống kê cơ bản
        print("\n📊 Thống kê dữ liệu:")
        print(df_features.describe())
        
    except FileNotFoundError as e:
        print(f"❌ Lỗi: Không tìm thấy file dữ liệu - {e}")
        print("💡 Hãy đảm bảo các file CSV đã được đặt trong thư mục data/")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    main() 