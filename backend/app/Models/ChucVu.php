<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChucVu extends Model
{
    protected $connection = 'mysql_nhansu';
    protected $table = 'chuc_vu';

    protected $fillable = ['ten', 'mo_ta'];

    public function nhanViens()
    {
        return $this->hasMany(NhanVien::class, 'chuc_vu_id');
    }
}