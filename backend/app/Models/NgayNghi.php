<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NgayNghi extends Model
{
    use HasFactory;

    protected $connection = 'mysql_nhansu';
    protected $table = 'ngay_nghi';

    protected $fillable = [
        'ten_ngay_nghi',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'loai',
        'ghi_chu'
    ];

    protected $casts = [
        'ngay_bat_dau' => 'date',
        'ngay_ket_thuc' => 'date'
    ];

    public static function isHoliday($date)
    {
        return self::where('ngay_bat_dau', '<=', $date)
                   ->where('ngay_ket_thuc', '>=', $date)
                   ->exists();
    }
}