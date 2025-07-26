<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql_nhansu')->create('face_data', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nhan_vien_id');
            $table->json('face_descriptor'); // Lưu dữ liệu khuôn mặt
            $table->timestamps();
            
            $table->foreign('nhan_vien_id')->references('id')->on('nhan_vien')->onDelete('cascade');
            $table->unique('nhan_vien_id');
        });
    }

    public function down(): void
    {
        Schema::connection('mysql_nhansu')->dropIfExists('face_data');
    }
};