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
      Schema::create('journal_items', function (Blueprint $table) {
    $table->id();
    $table->string('tenant_id');
    $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
    $table->foreignId('journal_entry_id')->constrained('journal_entries')->cascadeOnDelete();
    $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
    $table->decimal('debit', 12, 2)->default(0);   // مدين
    $table->decimal('credit', 12, 2)->default(0);  // دائن
    $table->string('description')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_items');
    }
};
