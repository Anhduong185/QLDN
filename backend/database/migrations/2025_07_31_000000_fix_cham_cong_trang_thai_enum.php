<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Cập nhật enum values cho cột trang_thai
        DB::connection('mysql_nhansu')->statement("
            ALTER TABLE cham_cong 
            MODIFY COLUMN trang_thai ENUM('co_mat', 'vang_mat', 'tre', 'som') DEFAULT 'co_mat'
        ");
    }

    public function down(): void
    {
        // Không cần rollback vì chỉ sửa enum values
    }
}; 