<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChamCong extends Model
{
    use HasFactory;

    protected $connection = 'mysql_nhansu';
    protected $table = 'cham_cong';

   protected $fillable = [
    'nhan_vien_id',
    'ca_lam_viec_id',
    'ngay',
    'gio_vao',
    'gio_ra',
    'trang_thai',
    'phut_tre',
    'phut_som',
    'gio_lam_thuc_te',
    'gio_tang_ca',
    'ghi_chu',
    'ip_address',
    'device_info'
];

protected $casts = [
    'ngay' => 'date',
    'gio_vao' => 'datetime:H:i:s',
    'gio_ra' => 'datetime:H:i:s',
    'gio_lam_thuc_te' => 'decimal:2',
    'gio_tang_ca' => 'decimal:2',
    'trang_thai' => 'string'
];
    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
    public function caLamViec()
{
    return $this->belongsTo(CaLamViec::class, 'ca_lam_viec_id');
}
}