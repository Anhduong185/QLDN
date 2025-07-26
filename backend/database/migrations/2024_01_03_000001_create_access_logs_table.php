<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql_nhansu')->create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nhan_vien_id');
            $table->timestamp('thoi_gian');
            $table->enum('loai_su_kien', ['vao', 'ra']);
            $table->string('vi_tri')->nullable();
            $table->string('ghi_chu')->nullable();
            $table->timestamps();
            $table->foreign('nhan_vien_id')->references('id')->on('nhan_vien')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::connection('mysql_nhansu')->dropIfExists('access_logs');
    }
}; 