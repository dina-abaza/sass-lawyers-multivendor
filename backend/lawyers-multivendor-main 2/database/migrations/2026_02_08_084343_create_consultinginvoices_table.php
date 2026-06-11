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
       Schema::create('consultinginvoices', function (Blueprint $table) {
    $table->id(); 
    $table->foreignId('consultation_id')
        ->constrained('consultations')
        ->cascadeOnDelete();
    $table->string('tenant_id');
    $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
    $table->decimal('amount', 15, 2);
    $table->decimal('tax_rate', 5, 2);
    $table->decimal('tax_value', 15, 2);
    $table->decimal('total_amount', 15, 2);
    $table->foreignId('journal_entry_id')
          ->nullable()
          ->constrained('journal_entries')
          ->nullOnDelete();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultinginvoices');
    }
};
