<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaLamViec extends Model
{
    use HasFactory;

    protected $connection = 'mysql_nhansu';
    protected $table = 'ca_lam_viec';

    protected $fillable = [
        'ten_ca',
        'gio_bat_dau',
        'gio_ket_thuc',
        'phut_tre_cho_phep',
        'phut_som_cho_phep',
        'active'
    ];

    protected $casts = [
        'gio_bat_dau' => 'datetime:H:i:s',
        'gio_ket_thuc' => 'datetime:H:i:s',
        'active' => 'boolean'
    ];

    public function chamCongs()
    {
        return $this->hasMany(ChamCong::class, 'ca_lam_viec_id');
    }
}