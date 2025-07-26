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
        Schema::create('ai_model_updates', function (Blueprint $table) {
            $table->id();
            $table->timestamp('last_update');
            $table->integer('samples_added')->default(0);
            $table->string('model_version')->nullable();
            $table->text('update_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_model_updates');
    }
}; 