<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NhanVien extends Model
{
    use HasFactory;

    protected $connection = 'mysql_nhansu';
    protected $table = 'nhan_vien';

    protected $fillable = [
        'ma_nhan_vien', 'ten', 'email', 'so_dien_thoai',
        'gioi_tinh', 'ngay_sinh', 'dia_chi', 'phong_ban_id',
        'chuc_vu_id', 'anh_dai_dien', 'trang_thai'
    ];

    protected $casts = [
        'ngay_sinh' => 'date',
        'trang_thai' => 'boolean'
    ];

    public function phongBan()
    {
        return $this->belongsTo(PhongBan::class, 'phong_ban_id');
    }

    public function chucVu()
    {
        return $this->belongsTo(ChucVu::class, 'chuc_vu_id');
    }

    public function chamCongs()
    {
        return $this->hasMany(ChamCong::class, 'nhan_vien_id');
    }

    public function faceData()
    {
        return $this->hasOne(FaceData::class, 'nhan_vien_id');
    }

    public function taiKhoan()
    {
        return $this->hasOne(TaiKhoan::class, 'nhan_vien_id');
    }

    public function caLamViec()
    {
        return $this->belongsTo(CaLamViec::class, 'ca_lam_viec_id');
    }
}