<?php
/**
 * Script test tất cả các routes của backend
 * Chạy: php test_backend_routes.php
 */

$baseUrl = 'http://localhost:8000/api';

$routes = [
    // NhanVien routes
    'GET /nhan-vien' => '/nhan-vien',
    'POST /nhan-vien' => '/nhan-vien',
    'GET /nhan-vien/dashboard' => '/nhan-vien/dashboard',
    'GET /nhan-vien/form-data' => '/nhan-vien/form-data',
    
    // ChamCong routes
    'POST /cham-cong/register-face' => '/cham-cong/register-face',
    'POST /cham-cong/check-in' => '/cham-cong/check-in',
    'POST /cham-cong/check-out' => '/cham-cong/check-out',
    'GET /cham-cong/access-logs' => '/cham-cong/access-logs',
    'GET /cham-cong/dashboard' => '/cham-cong/dashboard',
    'GET /cham-cong/export-excel' => '/cham-cong/export-excel',
    'GET /cham-cong/export-raw-data' => '/cham-cong/export-raw-data',
    'GET /cham-cong/all' => '/cham-cong/all',
    'GET /cham-cong/today' => '/cham-cong/today',
    
    // DonNghiPhep routes
    'POST /don-nghi-phep' => '/don-nghi-phep',
    'GET /don-nghi-phep' => '/don-nghi-phep',
    
    // AI Analysis routes
    'POST /ai-analysis/predict-attrition' => '/ai-analysis/predict-attrition',
    'GET /ai-analysis/predict-batch-attrition' => '/ai-analysis/predict-batch-attrition',
    'GET /ai-analysis/stats' => '/ai-analysis/stats',
    'GET /ai-analysis/collect-data' => '/ai-analysis/collect-data',
    'POST /ai-analysis/update-model' => '/ai-analysis/update-model',
    'GET /ai-analysis/analyze-trends' => '/ai-analysis/analyze-trends',
    
    // Statistics routes
    'GET /statistics/basic-stats' => '/statistics/basic-stats',
    'GET /statistics/attendance-stats' => '/statistics/attendance-stats',
    'GET /statistics/leave-stats' => '/statistics/leave-stats',
    'GET /statistics/advanced-ai-stats' => '/statistics/advanced-ai-stats',
];

echo "=== TESTING BACKEND ROUTES ===\n";
echo "Base URL: $baseUrl\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

foreach ($routes as $method => $route) {
    $url = $baseUrl . $route;
    
    // Chỉ test GET routes để tránh thay đổi dữ liệu
    if (strpos($method, 'GET') === 0) {
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPGET, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        echo sprintf("%-40s | HTTP %d", $method, $httpCode);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            echo " ✅";
        } elseif ($httpCode == 404) {
            echo " ❌ (Not Found)";
        } elseif ($httpCode == 500) {
            echo " ❌ (Server Error)";
        } else {
            echo " ⚠️  (HTTP $httpCode)";
        }
        echo "\n";
    }
}

curl_close($ch);

echo "\n=== ROUTE TESTING COMPLETE ===\n";
echo "✅ - Success (200-299)\n";
echo "❌ - Error (404, 500, etc.)\n";
echo "⚠️  - Warning (other HTTP codes)\n"; 