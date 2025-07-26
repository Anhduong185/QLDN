<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Collection;

class ChamCongExport implements FromCollection, WithHeadings
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        // Chuyển đổi dữ liệu về dạng Collection các mảng đơn giản
        return collect($this->data)->map(function ($item) {
            return [
                $item->id,
                $item->nhanVien->ten ?? '',
                $item->ngay,
                $item->gio_vao,
                $item->gio_ra,
                $item->trang_thai,
                $item->ghi_chu,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID', 'Nhân viên', 'Ngày', 'Giờ vào', 'Giờ ra', 'Trạng thái', 'Ghi chú'
        ];
    }
} 