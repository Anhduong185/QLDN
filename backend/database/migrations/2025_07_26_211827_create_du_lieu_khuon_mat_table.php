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
        Schema::create('du_lieu_khuon_mat', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nhan_vien_id');
            $table->json('du_lieu_khuon_mat');
            $table->timestamps();
            
            $table->foreign('nhan_vien_id')->references('id')->on('nhan_vien')->onDelete('cascade');
            $table->unique('nhan_vien_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('du_lieu_khuon_mat');
    }
}; 