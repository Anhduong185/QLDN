<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql_nhansu')->create('ca_lam_viec', function (Blueprint $table) {
            $table->id();
            $table->string('ten_ca');
            $table->time('gio_bat_dau');
            $table->time('gio_ket_thuc');
            $table->integer('phut_tre_cho_phep')->default(15);
            $table->integer('phut_som_cho_phep')->default(15);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('mysql_nhansu')->dropIfExists('ca_lam_viec');
    }
};