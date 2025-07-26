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
        Schema::connection('mysql_nhansu')->table('nhan_vien', function (Blueprint $table) {
            $table->date('ngay_vao_lam')->nullable()->after('dia_chi');
            $table->decimal('luong_co_ban', 12, 2)->nullable()->after('ngay_vao_lam');
            $table->string('cmnd_cccd')->nullable()->after('luong_co_ban');
            $table->string('noi_sinh')->nullable()->after('cmnd_cccd');
            $table->string('dan_toc')->nullable()->after('noi_sinh');
            $table->string('ton_giao')->nullable()->after('dan_toc');
            $table->string('tinh_trang_hon_nhan')->nullable()->after('ton_giao');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql_nhansu')->table('nhan_vien', function (Blueprint $table) {
            $table->dropColumn([
                'ngay_vao_lam',
                'luong_co_ban',
                'cmnd_cccd',
                'noi_sinh',
                'dan_toc',
                'ton_giao',
                'tinh_trang_hon_nhan'
            ]);
        });
    }
};
