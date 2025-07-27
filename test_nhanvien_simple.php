<?php
/**
 * Test đơn giản cho routes nhân viên
 */

$baseUrl = 'http://localhost:8000/api';

$routes = [
    'GET /nhan-vien' => '/nhan-vien',
    'GET /nhan-vien/dashboard' => '/nhan-vien/dashboard',
    'GET /nhan-vien/form-data' => '/nhan-vien/form-data',
];

echo "=== TESTING NHAN VIEN ROUTES ===\n";
echo "Base URL: $baseUrl\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

foreach ($routes as $method => $route) {
    $url = $baseUrl . $route;
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPGET, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    echo sprintf("%-30s | HTTP %d", $method, $httpCode);
    
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
    
    // Hiển thị response ngắn gọn
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if (isset($data['success'])) {
            echo "   └─ Success: " . ($data['success'] ? 'true' : 'false') . "\n";
        }
    }
}

curl_close($ch);

echo "\n=== TEST COMPLETE ===\n"; 