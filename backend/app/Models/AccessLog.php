<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessLog extends Model
{
    use HasFactory;
    protected $connection = 'mysql_nhansu';
    protected $table = 'access_logs';
    protected $fillable = [
        'nhan_vien_id', 'thoi_gian', 'loai_su_kien', 'vi_tri', 'ghi_chu'
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
} 