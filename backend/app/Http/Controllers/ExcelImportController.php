<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\GeminiService;
use App\Models\NhanVien;
use App\Models\PhongBan;
use App\Models\ChucVu;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ExcelImportController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * Import Excel với AI tự động xử lý
     */
    public function importWithAI(Request $request): JsonResponse
    {
        try {
            // Kiểm tra file
            if (!$request->hasFile('file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy file upload'
                ], 400);
            }

            $file = $request->file('file');
            $autoProcess = $request->input('auto_process', true);
            
            // Kiểm tra file type
            $allowedTypes = ['xlsx', 'xls', 'csv', 'txt'];
            $fileExtension = strtolower($file->getClientOriginalExtension());
            
            if (!in_array($fileExtension, $allowedTypes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File không được hỗ trợ. Chỉ chấp nhận: ' . implode(', ', $allowedTypes)
                ], 400);
            }

            // Đọc dữ liệu Excel
            try {
                $data = Excel::toArray([], $file);
                if (empty($data) || empty($data[0])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'File Excel không có dữ liệu'
                    ], 400);
                }
                $data = $data[0];
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể đọc file Excel: ' . $e->getMessage()
                ], 400);
            }
            
            if (empty($data) || count($data) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'File Excel không có dữ liệu hoặc thiếu header'
                ], 400);
            }

            $headers = $data[0];
            $rows = array_slice($data, 1);

            // AI phân tích cấu trúc Excel
            $analysis = $this->analyzeExcelStructure($headers, $rows);

            if ($autoProcess) {
                // Tự động xử lý với AI
                $result = $this->processWithAI($headers, $rows, $analysis);
            } else {
                // Trả về phân tích để user xem trước
                $result = [
                    'success' => true,
                    'analysis' => $analysis,
                    'preview' => array_slice($rows, 0, 5),
                    'total_rows' => count($rows)
                ];
            }

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('ExcelImport error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi import Excel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * AI phân tích cấu trúc Excel
     */
    private function analyzeExcelStructure(array $headers, array $rows): array
    {
        $prompt = "Phân tích cấu trúc Excel cho hệ thống QLNS:\n\n";
        $prompt .= "Headers: " . implode(', ', $headers) . "\n\n";
        $prompt .= "Sample data (first 3 rows):\n";
        for ($i = 0; $i < min(3, count($rows)); $i++) {
            $prompt .= "Row " . ($i + 1) . ": " . implode(', ', $rows[$i]) . "\n";
        }
        $prompt .= "\nTrả về JSON với mapping:\n";
        $prompt .= "- ma_nhan_vien: mã nhân viên\n";
        $prompt .= "- ten: tên nhân viên\n";
        $prompt .= "- email: email\n";
        $prompt .= "- so_dien_thoai: số điện thoại\n";
        $prompt .= "- phong_ban: phòng ban\n";
        $prompt .= "- chuc_vu: chức vụ\n";
        $prompt .= "- ngay_sinh: ngày sinh (YYYY-MM-DD)\n";
        $prompt .= "- gioi_tinh: giới tính\n";
        $prompt .= "- luong_co_ban: lương cơ bản\n";

        $conversation = [
            [
                'role' => 'system',
                'content' => 'Bạn là AI chuyên gia phân tích dữ liệu Excel. Trả về JSON mapping chính xác.'
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ];

        $response = $this->geminiService->generateResponse($conversation);
        
        if ($response['success']) {
            try {
                $mapping = json_decode($response['response'], true);
                return [
                    'mapping' => $mapping,
                    'headers' => $headers,
                    'total_rows' => count($rows),
                    'ai_confidence' => 'high'
                ];
            } catch (\Exception $e) {
                return [
                    'mapping' => $this->getDefaultMapping($headers),
                    'headers' => $headers,
                    'total_rows' => count($rows),
                    'ai_confidence' => 'low'
                ];
            }
        }

        return [
            'mapping' => $this->getDefaultMapping($headers),
            'headers' => $headers,
            'total_rows' => count($rows),
            'ai_confidence' => 'none'
        ];
    }

    /**
     * Xử lý dữ liệu với AI
     */
    private function processWithAI(array $headers, array $rows, array $analysis): array
    {
        $mapping = $analysis['mapping'];
        $processed = 0;
        $errors = [];
        $success = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $index => $row) {
                try {
                    $employeeData = $this->mapRowToEmployee($row, $headers, $mapping);
                    
                    // AI validate và clean data
                    $validatedData = $this->validateWithAI($employeeData);
                    
                    if ($validatedData['valid']) {
                        // Tạo nhân viên
                        $nhanVien = NhanVien::create($validatedData['data']);
                        $success[] = [
                            'row' => $index + 2,
                            'ma_nhan_vien' => $nhanVien->ma_nhan_vien,
                            'ten' => $nhanVien->ten
                        ];
                        $processed++;
                    } else {
                        $errors[] = [
                            'row' => $index + 2,
                            'error' => $validatedData['message']
                        ];
                    }
                } catch (\Exception $e) {
                    $errors[] = [
                        'row' => $index + 2,
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return [
                'success' => true,
                'processed' => $processed,
                'errors' => $errors,
                'success_list' => $success,
                'total_rows' => count($rows)
            ];

        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Map row data thành employee data
     */
    private function mapRowToEmployee(array $row, array $headers, array $mapping): array
    {
        $data = [];
        
        foreach ($mapping as $field => $headerIndex) {
            if (isset($headers[$headerIndex]) && isset($row[$headerIndex])) {
                $value = trim($row[$headerIndex]);
                
                // Map đúng field names
                switch ($field) {
                    case 'ma_nhan_vien':
                        $data['ma_nhan_vien'] = $value;
                        break;
                    case 'ten':
                        $data['ten'] = $value;
                        break;
                    case 'email':
                        $data['email'] = $value;
                        break;
                    case 'so_dien_thoai':
                        $data['so_dien_thoai'] = $value;
                        break;
                    case 'ngay_sinh':
                        $data['ngay_sinh'] = $value;
                        break;
                    case 'gioi_tinh':
                        $data['gioi_tinh'] = $value;
                        break;
                    case 'phong_ban':
                        // Tìm phong_ban_id từ tên phòng ban
                        $phongBan = PhongBan::where('ten', $value)->first();
                        if (!$phongBan) {
                            // Thử tìm với LIKE nếu không tìm thấy exact match
                            $phongBan = PhongBan::where('ten', 'like', '%' . $value . '%')->first();
                        }
                        $data['phong_ban_id'] = $phongBan ? $phongBan->id : null;
                        break;
                    case 'chuc_vu':
                        // Tìm chuc_vu_id từ tên chức vụ
                        $chucVu = ChucVu::where('ten', $value)->first();
                        if (!$chucVu) {
                            // Thử tìm với LIKE nếu không tìm thấy exact match
                            $chucVu = ChucVu::where('ten', 'like', '%' . $value . '%')->first();
                        }
                        $data['chuc_vu_id'] = $chucVu ? $chucVu->id : null;
                        break;
                    case 'luong_co_ban':
                        // Bỏ qua lương vì không có field này trong DB
                        break;
                    default:
                        $data[$field] = $value;
                        break;
                }
            }
        }
        
        return $data;
    }

    /**
     * AI validate và clean data
     */
    private function validateWithAI(array $data): array
    {
        $prompt = "Validate dữ liệu nhân viên:\n\n";
        $prompt .= "Data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
        $prompt .= "Kiểm tra:\n";
        $prompt .= "1. Email hợp lệ\n";
        $prompt .= "2. Số điện thoại hợp lệ\n";
        $prompt .= "3. Ngày sinh hợp lệ\n";
        $prompt .= "4. Mã nhân viên unique\n";
        $prompt .= "5. Tên không rỗng\n\n";
        $prompt .= "Trả về JSON: {\"valid\": true/false, \"data\": {...}, \"message\": \"...\"}";

        $conversation = [
            [
                'role' => 'system',
                'content' => 'Bạn là AI validator chuyên nghiệp. Trả về JSON chính xác.'
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ];

        $response = $this->geminiService->generateResponse($conversation);
        
        if ($response['success']) {
            try {
                $result = json_decode($response['response'], true);
                return $result;
            } catch (\Exception $e) {
                return $this->defaultValidation($data);
            }
        }

        return $this->defaultValidation($data);
    }

    /**
     * Default validation khi AI không hoạt động
     */
    private function defaultValidation(array $data): array
    {
        $errors = [];

        // Kiểm tra email
        if (empty($data['email'])) {
            $errors[] = 'Email không được để trống';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Email không hợp lệ';
        }

        // Kiểm tra tên
        if (empty($data['ten'])) {
            $errors[] = 'Tên không được để trống';
        }

        // Kiểm tra mã nhân viên
        if (empty($data['ma_nhan_vien'])) {
            $errors[] = 'Mã nhân viên không được để trống';
        } else {
            $exists = NhanVien::where('ma_nhan_vien', $data['ma_nhan_vien'])->exists();
            if ($exists) {
                $errors[] = 'Mã nhân viên đã tồn tại';
            }
        }

        // Kiểm tra email unique
        if (!empty($data['email'])) {
            $exists = NhanVien::where('email', $data['email'])->exists();
            if ($exists) {
                $errors[] = 'Email đã tồn tại';
            }
        }

        // Đảm bảo các trường bắt buộc có giá trị
        $requiredFields = ['ma_nhan_vien', 'ten', 'email'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' không được để trống';
            }
        }

        if (empty($errors)) {
            return [
                'valid' => true,
                'data' => $data,
                'message' => 'Dữ liệu hợp lệ'
            ];
        }

        return [
            'valid' => false,
            'data' => $data,
            'message' => implode(', ', $errors)
        ];
    }

    /**
     * Default mapping khi AI không hoạt động
     */
    private function getDefaultMapping(array $headers): array
    {
        $mapping = [];
        
        foreach ($headers as $index => $header) {
            $header = strtolower(trim($header));
            
            if (strpos($header, 'mã') !== false || strpos($header, 'ma') !== false) {
                $mapping['ma_nhan_vien'] = $index;
            } elseif (strpos($header, 'tên') !== false || strpos($header, 'ten') !== false) {
                $mapping['ten'] = $index;
            } elseif (strpos($header, 'email') !== false) {
                $mapping['email'] = $index;
            } elseif (strpos($header, 'điện thoại') !== false || strpos($header, 'phone') !== false || strpos($header, 'số điện thoại') !== false) {
                $mapping['so_dien_thoai'] = $index;
            } elseif (strpos($header, 'phòng ban') !== false || strpos($header, 'phong ban') !== false) {
                $mapping['phong_ban'] = $index;
            } elseif (strpos($header, 'chức vụ') !== false || strpos($header, 'chuc vu') !== false) {
                $mapping['chuc_vu'] = $index;
            } elseif (strpos($header, 'ngày sinh') !== false || strpos($header, 'ngay sinh') !== false) {
                $mapping['ngay_sinh'] = $index;
            } elseif (strpos($header, 'giới tính') !== false || strpos($header, 'gioi tinh') !== false) {
                $mapping['gioi_tinh'] = $index;
            } elseif (strpos($header, 'lương') !== false || strpos($header, 'luong') !== false) {
                $mapping['luong_co_ban'] = $index;
            }
        }
        
        // Manual mapping cho file CSV hiện tại
        if (count($headers) >= 8) {
            $mapping = [
                'ma_nhan_vien' => 0,  // Mã nhân viên
                'ten' => 1,           // Tên nhân viên
                'email' => 2,         // Email
                'so_dien_thoai' => 3, // Số điện thoại
                'ngay_sinh' => 4,     // Ngày sinh
                'gioi_tinh' => 5,     // Giới tính
                'phong_ban' => 6,     // Phòng ban
                'chuc_vu' => 7        // Chức vụ
            ];
        }
        
        return $mapping;
    }

    /**
     * Get import template
     */
    public function getTemplate(): JsonResponse
    {
        $template = [
            'headers' => [
                'Mã nhân viên',
                'Tên nhân viên', 
                'Email',
                'Số điện thoại',
                'Ngày sinh',
                'Giới tính',
                'Phòng ban',
                'Chức vụ',
                'Lương cơ bản'
            ],
            'sample_data' => [
                [
                    'NV001',
                    'Nguyễn Văn A',
                    'nva@company.com',
                    '0123456789',
                    '1990-01-01',
                    'Nam',
                    'IT',
                    'Nhân viên',
                    '15000000'
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'template' => $template
        ]);
    }

    /**
     * Download Excel template với encoding UTF-8 BOM
     */
    public function downloadTemplate()
    {
        try {
            // Tạo dữ liệu template
            $headers = [
                'Mã nhân viên',
                'Tên nhân viên', 
                'Email',
                'Số điện thoại',
                'Ngày sinh',
                'Giới tính',
                'Phòng ban',
                'Chức vụ',
                'Lương cơ bản'
            ];

            $sampleData = [
                [
                    'NV001',
                    'Nguyễn Văn A',
                    'nva@company.com',
                    '0123456789',
                    '1990-01-01',
                    'Nam',
                    'IT',
                    'Nhân viên',
                    '15000000'
                ]
            ];

            // Tạo file Excel với encoding UTF-8 BOM
            $filename = 'template_nhan_vien_' . date('Y-m-d_H-i-s') . '.xlsx';
            
            return Excel::download(new class($headers, $sampleData) implements \Maatwebsite\Excel\Concerns\FromArray, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithStyles, \Maatwebsite\Excel\Concerns\WithColumnWidths {
                private $headers;
                private $sampleData;

                public function __construct($headers, $sampleData)
                {
                    $this->headers = $headers;
                    $this->sampleData = $sampleData;
                }

                public function array(): array
                {
                    return $this->sampleData;
                }

                public function headings(): array
                {
                    return $this->headers;
                }

                public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
                {
                    return [
                        1 => [
                            'font' => [
                                'bold' => true,
                                'color' => ['rgb' => 'FFFFFF']
                            ],
                            'fill' => [
                                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                                'startColor' => ['rgb' => '4472C4']
                            ],
                            'alignment' => [
                                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER
                            ]
                        ]
                    ];
                }

                public function columnWidths(): array
                {
                    return [
                        'A' => 15, // Mã nhân viên
                        'B' => 25, // Tên nhân viên
                        'C' => 25, // Email
                        'D' => 15, // Số điện thoại
                        'E' => 15, // Ngày sinh
                        'F' => 10, // Giới tính
                        'G' => 15, // Phòng ban
                        'H' => 15, // Chức vụ
                        'I' => 15  // Lương cơ bản
                    ];
                }
            }, $filename, \Maatwebsite\Excel\Excel::XLSX, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ]);

        } catch (\Exception $e) {
            Log::error('Template download error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download CSV template với encoding UTF-8 BOM
     */
    public function downloadCsvTemplate()
    {
        try {
            // Tạo dữ liệu template
            $headers = [
                'Mã nhân viên',
                'Tên nhân viên', 
                'Email',
                'Số điện thoại',
                'Ngày sinh',
                'Giới tính',
                'Phòng ban',
                'Chức vụ',
                'Lương cơ bản'
            ];

            $sampleData = [
                [
                    'NV001',
                    'Nguyễn Văn A',
                    'nva@company.com',
                    '0123456789',
                    '1990-01-01',
                    'Nam',
                    'IT',
                    'Nhân viên',
                    '15000000'
                ],
                [
                    'NV002',
                    'Trần Thị B',
                    'ttb@company.com',
                    '0987654321',
                    '1985-05-15',
                    'Nữ',
                    'HR',
                    'Trưởng phòng',
                    '20000000'
                ]
            ];

            $filename = 'template_nhan_vien_' . date('Y-m-d_H-i-s') . '.csv';
            
            // Tạo CSV với UTF-8 BOM
            $csvContent = "\xEF\xBB\xBF"; // UTF-8 BOM
            $csvContent .= implode(',', $headers) . "\n";
            
            foreach ($sampleData as $row) {
                $csvContent .= implode(',', array_map(function($field) {
                    // Escape quotes và wrap trong quotes nếu có dấu phẩy
                    $field = str_replace('"', '""', $field);
                    if (strpos($field, ',') !== false || strpos($field, '"') !== false) {
                        return '"' . $field . '"';
                    }
                    return $field;
                }, $row)) . "\n";
            }

            return response($csvContent, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ]);

        } catch (\Exception $e) {
            Log::error('CSV template download error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo CSV template: ' . $e->getMessage()
            ], 500);
        }
    }
} 