<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql_nhansu')->create('don_nghi_phep', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nhan_vien_id');
            $table->date('ngay_nghi');
            $table->enum('loai_nghi', ['ca_ngay', 'nua_ngay', 'theo_gio']);
            $table->time('thoi_gian_bat_dau')->nullable();
            $table->time('thoi_gian_ket_thuc')->nullable();
            $table->string('ly_do')->nullable();
            $table->string('trang_thai')->default('cho_duyet'); // 'cho_duyet', 'da_duyet', 'tu_choi'
            $table->timestamps();
            $table->foreign('nhan_vien_id')->references('id')->on('nhan_vien')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::connection('mysql_nhansu')->dropIfExists('don_nghi_phep');
    }
}; 