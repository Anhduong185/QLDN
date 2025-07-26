"""
Huấn luyện model AI dự đoán nguy cơ nghỉ việc
Sử dụng dữ liệu đã được xử lý từ process_data.py
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib
import os

def load_processed_data():
    """Đọc dữ liệu đã được xử lý"""
    data_path = 'data/nhan_su_processed.csv'
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Không tìm thấy file {data_path}. Hãy chạy process_data.py trước!")
    
    df = pd.read_csv(data_path, index_col=0)
    print(f"✅ Đã đọc {len(df)} nhân viên với {len(df.columns)} features")
    
    return df

def prepare_features_and_labels(df):
    """Chuẩn bị features và labels cho model"""
    # Danh sách features (bỏ qua cột label nếu có)
    feature_columns = [
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
    
    # Kiểm tra xem có đủ features không
    missing_features = [col for col in feature_columns if col not in df.columns]
    if missing_features:
        print(f"⚠️ Thiếu features: {missing_features}")
        # Chỉ sử dụng features có sẵn
        feature_columns = [col for col in feature_columns if col in df.columns]
    
    X = df[feature_columns].copy()
    
    # Xử lý dữ liệu thiếu
    X = X.fillna(0)
    
    # Chuẩn hóa dữ liệu
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled = pd.DataFrame(X_scaled, columns=X.columns, index=X.index)
    
    # Chuẩn bị labels
    if 'nghi_viec' in df.columns:
        y = df['nghi_viec']
        print(f"✅ Sử dụng label 'nghi_viec' có sẵn")
    else:
        # Tạo label giả định dựa trên các tiêu chí
        print("⚠️ Không có label 'nghi_viec', tạo label giả định...")
        y = create_synthetic_labels(df)
    
    print(f"📊 Phân bố labels: {y.value_counts().to_dict()}")
    
    return X_scaled, y, scaler, feature_columns

def create_synthetic_labels(df):
    """Tạo labels giả định cho mục đích demo"""
    # Tạo label dựa trên các tiêu chí:
    # - Nghỉ phép nhiều (>5 ngày/năm)
    # - Đi muộn nhiều (>5 lần/năm) 
    # - Về sớm nhiều (>3 lần/năm)
    # - Ít ngày đi làm (<10 ngày/năm)
    
    # Tạo điều kiện tổng hợp
    high_risk = (
        (df['tong_ngay_nghi_phep'] > 5) |
        (df['so_lan_di_muon'] > 5) |
        (df['so_lan_ve_som'] > 3) |
        (df['so_ngay_di_lam'] < 10)
    )
    
    y = np.where(high_risk, 1, 0)  # 1: có nguy cơ nghỉ việc, 0: không
    
    # Đảm bảo có ít nhất 2 class
    if y.sum() == 0:
        # Nếu không có ai có nguy cơ, chọn ngẫu nhiên 20% nhân viên
        n_high_risk = max(1, int(len(df) * 0.2))
        high_risk_indices = np.random.choice(len(df), n_high_risk, replace=False)
        y[high_risk_indices] = 1
    elif y.sum() == len(df):
        # Nếu tất cả đều có nguy cơ, chọn ngẫu nhiên 80% nhân viên
        n_low_risk = max(1, int(len(df) * 0.8))
        low_risk_indices = np.random.choice(len(df), n_low_risk, replace=False)
        y[low_risk_indices] = 0
    
    return pd.Series(y, index=df.index)

def train_model(X, y):
    """Huấn luyện model Random Forest"""
    print("🤖 Bắt đầu huấn luyện model...")
    
    # Chia dữ liệu train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"📈 Train set: {len(X_train)} samples")
    print(f"📊 Test set: {len(X_test)} samples")
    
    # Huấn luyện model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced'  # Xử lý mất cân bằng dữ liệu
    )
    
    model.fit(X_train, y_train)
    
    # Đánh giá model
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # In kết quả đánh giá
    print("\n📊 Kết quả đánh giá model:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"\nCross-validation scores: {cv_scores}")
    print(f"CV Accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
    
    return model, X_test, y_test, y_pred, y_pred_proba

def analyze_feature_importance(model, feature_names):
    """Phân tích tầm quan trọng của các features"""
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🎯 Tầm quan trọng của features:")
    for idx, row in feature_importance.head(10).iterrows():
        print(f"  {row['feature']}: {row['importance']:.3f}")
    
    return feature_importance

def save_model_and_metadata(model, scaler, feature_names, model_info):
    """Lưu model và metadata"""
    # Tạo thư mục models nếu chưa có
    models_dir = 'models'
    os.makedirs(models_dir, exist_ok=True)
    
    # Lưu model
    model_path = f'{models_dir}/attrition_model.pkl'
    joblib.dump(model, model_path)
    
    # Lưu scaler
    scaler_path = f'{models_dir}/scaler.pkl'
    joblib.dump(scaler, scaler_path)
    
    # Lưu metadata
    metadata = {
        'feature_names': feature_names,
        'model_info': model_info,
        'model_path': model_path,
        'scaler_path': scaler_path
    }
    
    metadata_path = f'{models_dir}/model_metadata.json'
    import json
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Đã lưu model vào: {model_path}")
    print(f"✅ Đã lưu scaler vào: {scaler_path}")
    print(f"✅ Đã lưu metadata vào: {metadata_path}")

def main():
    """Hàm chính huấn luyện model"""
    print("🚀 Bắt đầu quá trình huấn luyện model AI...")
    
    try:
        # Đọc dữ liệu đã xử lý
        df = load_processed_data()
        
        # Chuẩn bị features và labels
        X, y, scaler, feature_names = prepare_features_and_labels(df)
        
        # Huấn luyện model
        model, X_test, y_test, y_pred, y_pred_proba = train_model(X, y)
        
        # Phân tích feature importance
        feature_importance = analyze_feature_importance(model, feature_names)
        
        # Lưu model và metadata
        model_info = {
            'algorithm': 'RandomForestClassifier',
            'n_estimators': 100,
            'max_depth': 10,
            'accuracy': accuracy_score(y_test, y_pred),
            'cv_accuracy': cross_val_score(model, X, y, cv=5, scoring='accuracy').mean()
        }
        
        save_model_and_metadata(model, scaler, feature_names, model_info)
        
        print("\n🎉 Hoàn thành huấn luyện model!")
        print("💡 Bước tiếp theo: Chạy predict_api.py để tạo API dự đoán")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        print("💡 Hãy đảm bảo đã chạy process_data.py trước!")

if __name__ == "__main__":
    main() 