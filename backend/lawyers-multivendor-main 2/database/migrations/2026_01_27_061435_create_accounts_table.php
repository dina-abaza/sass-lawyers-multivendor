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
    Schema::create('accounts', function (Blueprint $table) {
    $table->id();
$table->string('tenant_id');
$table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
    $table->string('name');
    $table->enum('status', ['debitor', 'creditor']); // طبيعة الحساب
    $table->foreignId('parent_id')->nullable()
          ->constrained('accounts')
          ->cascadeOnDelete();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
