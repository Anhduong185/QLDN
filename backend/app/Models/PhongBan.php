<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhongBan extends Model
{
    protected $connection = 'mysql_nhansu';
    protected $table = 'phong_ban';

    protected $fillable = ['ten', 'mo_ta'];

    public function nhanViens()
    {
        return $this->hasMany(NhanVien::class, 'phong_ban_id');
    }
}