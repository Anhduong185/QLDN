<?php

// Test script để kiểm tra API nhân viên
$apiUrl = 'http://localhost:8000/api/nhan-vien';

// Test data
$testData = [
    'ma_nhan_vien' => 'NV003',
    'ten' => 'Nguyễn Văn A',
    'email' => 'nguyenvana@example.com',
    'so_dien_thoai' => '0123456789',
    'gioi_tinh' => 'nam',
    'ngay_sinh' => '1990-01-01',
    'dia_chi' => '123 Đường ABC, Quận 1, TP.HCM',
    'phong_ban_id' => 1,
    'chuc_vu_id' => 1,
    'ngay_vao_lam' => '2024-01-01',
    'luong_co_ban' => 15000000,
    'trang_thai' => 1
];

// Test GET request
echo "Testing GET request...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "GET Response Code: $httpCode\n";
echo "GET Response: " . $response . "\n\n";

// Test POST request
echo "Testing POST request...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "POST Response Code: $httpCode\n";
echo "POST Response: " . $response . "\n\n";

// Test form data
echo "Testing POST with form data...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $testData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "POST Form Data Response Code: $httpCode\n";
echo "POST Form Data Response: " . $response . "\n\n"; 