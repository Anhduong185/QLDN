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
        Schema::table('cham_cong', function (Blueprint $table) {
            // Thay đổi enum trang_thai để hỗ trợ các trạng thái mới
            $table->enum('trang_thai', [
                'co_mat', 'vang_mat', 'tre', 'som', // Trạng thái cũ
                'dung_gio', 'di_muon', 've_som', 'vang' // Trạng thái mới
            ])->default('co_mat')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cham_cong', function (Blueprint $table) {
            // Khôi phục enum cũ
            $table->enum('trang_thai', ['co_mat', 'vang_mat', 'tre', 'som'])->default('co_mat')->change();
        });
    }
};
