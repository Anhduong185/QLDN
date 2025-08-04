# 🚀 Hướng Dẫn Cấu Hình Environment Variables

## 📋 Danh Sách Biến Môi Trường Cần Thiết

### 🔑 **BẮT BUỘC - Cấu Hình Cơ Bản**

```env
# Laravel App
APP_NAME="QLNS Pro"
APP_ENV=local
APP_KEY=base64:your_app_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=qlns_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 🤖 **AI & CHATBOT - Bắt Buộc cho Chatbot**

```env
# Gemini AI (Khuyến nghị)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
GEMINI_TIMEOUT=30

# Hoặc Ollama (Local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
OLLAMA_TIMEOUT=30

# Hoặc Hugging Face
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL=google/gemma-2b-it
HUGGINGFACE_TIMEOUT=30
```

### 📸 **FACE RECOGNITION - Bắt Buộc cho Chấm Công**

```env
# Face Recognition Settings
FACE_RECOGNITION_THRESHOLD=0.6
FACE_RECOGNITION_DESCRIPTOR_SIZE=128
FACE_RECOGNITION_MIN_FACE_SIZE=150
```

### ⏰ **ATTENDANCE SYSTEM - Cấu Hình Chấm Công**

```env
# Work Schedule
DEFAULT_WORK_START_TIME=08:00
DEFAULT_WORK_END_TIME=17:00
DEFAULT_LUNCH_START_TIME=12:00
DEFAULT_LUNCH_END_TIME=13:00

# Attendance Rules
LATE_THRESHOLD_MINUTES=15
EARLY_LEAVE_THRESHOLD_MINUTES=30
MIN_CHECK_IN_INTERVAL_MINUTES=1
```

### 🔒 **SECURITY - Bảo Mật**

```env
# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With

# Rate Limiting
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_MINUTES=1
```

### 📁 **FILE UPLOAD - Upload File**

```env
# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif
ALLOWED_EXCEL_TYPES=xlsx,xls,csv

# Storage Paths
FACE_DATA_STORAGE_PATH=storage/app/face_data
EXPORT_STORAGE_PATH=storage/app/exports
BACKUP_STORAGE_PATH=storage/app/backups
```

### 🐛 **DEVELOPMENT - Debug & Logging**

```env
# Debug Settings
DEBUG_AI_RESPONSES=true
DEBUG_FACE_RECOGNITION=true
DEBUG_ATTENDANCE_LOGIC=true

# Logging
LOG_AI_REQUESTS=true
LOG_FACE_RECOGNITION=true
LOG_ATTENDANCE_EVENTS=true
```

### 🏢 **CUSTOMIZATION - Tùy Chỉnh**

```env
# Company Information
COMPANY_NAME="Công ty ABC"
COMPANY_ADDRESS="123 Đường ABC, Quận 1, TP.HCM"
COMPANY_PHONE="+84 28 1234 5678"
COMPANY_EMAIL="info@company.com"

# System Branding
SYSTEM_LOGO_URL=/images/logo.png
SYSTEM_FAVICON_URL=/images/favicon.ico
SYSTEM_PRIMARY_COLOR=#1890ff
SYSTEM_SECONDARY_COLOR=#52c41a
```

## 🛠️ **Cách Cấu Hình**

### 1. **Tạo file .env**
```bash
cd backend
cp env.example .env
```

### 2. **Tạo APP_KEY**
```bash
php artisan key:generate
```

### 3. **Cấu hình Database**
- Tạo database `qlns_db`
- Cập nhật `DB_USERNAME` và `DB_PASSWORD`

### 4. **Cấu hình AI (Chọn 1 trong 3)**

#### **Option A: Gemini (Khuyến nghị)**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
- Lấy API key từ: https://makersuite.google.com/app/apikey

#### **Option B: Ollama (Local)**
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```
- Cài đặt Ollama: https://ollama.ai/
- Pull model: `ollama pull llama2`

#### **Option C: Hugging Face**
```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL=google/gemma-2b-it
```
- Lấy API key từ: https://huggingface.co/settings/tokens

### 5. **Chạy Migration**
```bash
php artisan migrate
```

### 6. **Tạo Storage Links**
```bash
php artisan storage:link
```

## ✅ **Kiểm Tra Cấu Hình**

### **Test Database**
```bash
php artisan migrate:status
```

### **Test AI Connection**
```bash
curl -X GET http://localhost:8000/api/chatbot/status
```

### **Test Face Recognition**
```bash
curl -X POST http://localhost:8000/api/cham-cong/register-face
```

## 🚨 **Lưu Ý Quan Trọng**

1. **Bảo mật**: Không commit file `.env` lên git
2. **API Keys**: Bảo vệ API keys, không chia sẻ công khai
3. **Database**: Backup database thường xuyên
4. **Environment**: Sử dụng environment khác nhau cho dev/prod

## 🔧 **Troubleshooting**

### **Lỗi Database**
```bash
php artisan config:clear
php artisan cache:clear
```

### **Lỗi AI**
- Kiểm tra API key
- Kiểm tra internet connection
- Kiểm tra model availability

### **Lỗi Face Recognition**
- Kiểm tra camera permissions
- Kiểm tra face-api.js models
- Kiểm tra browser compatibility 