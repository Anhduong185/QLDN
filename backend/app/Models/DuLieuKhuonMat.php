<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DuLieuKhuonMat extends Model
{
    use HasFactory;

    protected $connection = 'mysql_nhansu';
    protected $table = 'du_lieu_khuon_mat';

    protected $fillable = [
        'nhan_vien_id',
        'du_lieu_khuon_mat'
    ];

    protected $casts = [
        'du_lieu_khuon_mat' => 'array'
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
} 