# remove-large-files.ps1
$files = @(
  "frontend.rar",
  "frontend/node_modules/.cache/default-development/5.pack",
  "frontend/node_modules/.cache/default-development/3.pack",
  "frontend/public/models/proto/ssd_mobilenet_face_optimized_v2.pbtxt",
  "frontend/public/models/uncompressed/tiny_yolov2_model.weights"
)

foreach ($file in $files) {
  git filter-branch --force --index-filter "git rm --cached --ignore-unmatch $file" --prune-empty --tag-name-filter cat -- --all
}

Write-Host "✅ Đã xóa tất cả file lớn khỏi lịch sử Git."

Write-Host "⚠️ Giờ hãy chạy: git push origin --force"
