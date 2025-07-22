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
        Schema::connection('mysql_nhansu')->create('cham_cong_ai', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('nhan_vien_id');
            $table->string('ma_camera')->nullable();
            $table->timestamp('thoi_gian');
            $table->boolean('ket_qua')->default(0);
            $table->string('hinh_anh')->nullable();
            $table->timestamps();

            $table->foreign('nhan_vien_id')->references('id')->on('nhan_vien');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cham_cong_ai');
    }
};
