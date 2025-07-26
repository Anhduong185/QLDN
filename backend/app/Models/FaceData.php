<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaceData extends Model
{
    use HasFactory;

    protected $connection = 'mysql_nhansu';
    protected $table = 'face_data';

    protected $fillable = [
        'nhan_vien_id',
        'face_descriptor'
    ];

    protected $casts = [
        'face_descriptor' => 'array'
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
}