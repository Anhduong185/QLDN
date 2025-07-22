<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('mysql_nhansu')->create('nhan_vien', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('ma_nhan_vien')->unique();
            $table->string('ten');
            $table->string('email')->unique();
            $table->string('so_dien_thoai')->nullable();
            $table->string('gioi_tinh')->nullable();
            $table->date('ngay_sinh')->nullable();
            $table->string('dia_chi')->nullable();
            $table->unsignedBigInteger('phong_ban_id')->nullable();
            $table->unsignedBigInteger('chuc_vu_id')->nullable();
            $table->string('anh_dai_dien')->nullable();
            $table->boolean('trang_thai')->default(1);
            $table->timestamps();

            $table->foreign('phong_ban_id')->references('id')->on('phong_ban');
            $table->foreign('chuc_vu_id')->references('id')->on('chuc_vu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nhan_vien');
    }
};
