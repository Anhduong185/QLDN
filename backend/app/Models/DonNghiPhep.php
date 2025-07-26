<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonNghiPhep extends Model
{
    use HasFactory;
    protected $connection = 'mysql_nhansu';
    protected $table = 'don_nghi_phep';
    protected $fillable = [
        'nhan_vien_id', 'ngay_nghi', 'loai_nghi', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'ly_do', 'trang_thai'
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
} 