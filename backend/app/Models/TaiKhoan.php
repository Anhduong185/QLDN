<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaiKhoan extends Model
{
    use HasFactory;

    protected $connection = 'mysql_nhansu';
    protected $table = 'tai_khoan';

    protected $fillable = [
        'ten_dang_nhap',
        'mat_khau',
        'nhan_vien_id',
        'trang_thai',
        'quyen_han'
    ];

    protected $hidden = [
        'mat_khau'
    ];

    protected $casts = [
        'trang_thai' => 'boolean'
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
}
