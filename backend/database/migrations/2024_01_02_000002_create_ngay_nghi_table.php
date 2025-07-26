<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql_nhansu')->create('ngay_nghi', function (Blueprint $table) {
            $table->id();
            $table->string('ten_ngay_nghi');
            $table->date('ngay_bat_dau');
            $table->date('ngay_ket_thuc');
            $table->enum('loai', ['le', 'tet', 'phep', 'khac'])->default('khac');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('mysql_nhansu')->dropIfExists('ngay_nghi');
    }
};