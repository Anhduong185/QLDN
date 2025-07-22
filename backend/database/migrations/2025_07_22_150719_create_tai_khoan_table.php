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
        Schema::connection('mysql_nhansu')->create('tai_khoan', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('nhan_vien_id');
            $table->string('ten_dang_nhap')->unique();
            $table->string('mat_khau');
            $table->string('quyen')->default('user');
            $table->timestamps();

            $table->foreign('nhan_vien_id')->references('id')->on('nhan_vien');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tai_khoan');
    }
};
