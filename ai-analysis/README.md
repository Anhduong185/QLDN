# AI Phân Tích Dữ Liệu Nhân Sự

Hệ thống AI dự đoán nguy cơ nghỉ việc dựa trên dữ liệu chấm công và nghỉ phép thực tế.

## 🏗️ Cấu trúc Project

```
ai-analysis/
├── models/                 # Model AI đã train
│   ├── attrition_model.pkl
│   ├── scaler.pkl
│   └── model_metadata.json
├── src/                   # Source code Python
│   ├── predict_api.py     # Flask API để serve model
│   └── test_predict.py    # Script test API
├── notebooks/             # Jupyter notebooks (tùy chọn)
├── requirements.txt       # Python dependencies
└── README.md
```

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 2. Chạy toàn bộ hệ thống AI (Khuyến nghị)
```bash
python run_ai_analysis.py
```

Script này sẽ tự động:
- Xử lý dữ liệu từ CSV files
- Huấn luyện model AI
- Khởi động Flask API

### 3. Chạy từng bước riêng lẻ

#### Xử lý dữ liệu
```bash
python src/process_data.py
```

#### Huấn luyện model
```bash
python src/train_model.py
```

#### Khởi động API
```bash
python src/predict_api.py
```

API sẽ chạy tại: `http://localhost:5000`

### 4. Test API
```bash
python test_api.py
```

## 🔗 Tích hợp với Laravel

Laravel backend sẽ:
1. Lấy dữ liệu từ database MySQL
2. Tính toán features real-time
3. Gọi Flask API để dự đoán
4. Trả kết quả về React frontend

## 📊 Features được sử dụng

- **so_ngay_di_lam**: Số ngày đi làm
- **so_lan_di_muon**: Số lần đi muộn
- **so_lan_ve_som**: Số lần về sớm
- **gio_lam_viec_tb**: Giờ làm việc trung bình
- **tong_ngay_nghi_phep**: Tổng ngày nghỉ phép
- **so_don_nghi_phep**: Số đơn nghỉ phép
- **so_nam_lam_viec**: Số năm làm việc
- **phong_ban_encoded**: Mã hóa phòng ban
- **chuc_vu_encoded**: Mã hóa chức vụ
- **tuoi**: Tuổi

## 🎯 Kết quả dự đoán

- **prediction**: 0 (không có nguy cơ) / 1 (có nguy cơ)
- **probability**: Xác suất từ 0-1
- **risk_level**: "Thấp", "Trung bình", "Cao" 