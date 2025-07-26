<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::connection('mysql_nhansu')->hasTable('cham_cong')) {
            Schema::connection('mysql_nhansu')->create('cham_cong', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('nhan_vien_id');
                $table->unsignedBigInteger('ca_lam_viec_id')->nullable();
                $table->date('ngay');
                $table->time('gio_vao')->nullable();
                $table->time('gio_ra')->nullable();
                $table->enum('trang_thai', ['co_mat', 'vang_mat', 'tre', 'som'])->default('co_mat');
                $table->integer('phut_tre')->default(0);
                $table->integer('phut_som')->default(0);
                $table->decimal('gio_lam_thuc_te', 4, 2)->default(0);
                $table->decimal('gio_tang_ca', 4, 2)->default(0);
                $table->text('ghi_chu')->nullable();
                $table->string('ip_address')->nullable();
                $table->string('device_info')->nullable();
                $table->timestamps();

                // Thêm foreign key constraints
                $table->foreign('nhan_vien_id')->references('id')->on('nhan_vien')->onDelete('cascade');
                $table->foreign('ca_lam_viec_id')->references('id')->on('ca_lam_viec')->onDelete('set null');
            
                // Thêm unique constraint để tránh trùng lặp chấm công trong ngày
                $table->unique(['nhan_vien_id', 'ngay'], 'unique_nhan_vien_ngay');
            });
        }
    }

    public function down(): void
    {
        Schema::connection('mysql_nhansu')->table('cham_cong', function (Blueprint $table) {
            $table->dropForeign(['nhan_vien_id']);
            $table->dropForeign(['ca_lam_viec_id']);
            $table->dropUnique('unique_nhan_vien_ngay');
        });
    }
};