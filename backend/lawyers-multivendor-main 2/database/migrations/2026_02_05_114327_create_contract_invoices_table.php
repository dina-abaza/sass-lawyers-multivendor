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
    Schema::create('contract_invoices', function (Blueprint $table) {
        $table->id();
        $table->foreignId('contract_id')->constrained('contracts')->onDelete('cascade');
                    $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        $table->decimal('amount', 15, 2);      // المبلغ الأساسي
        $table->decimal('tax_rate', 5, 2);    // نسبة الضريبة (مثلاً 15.00)
        $table->decimal('tax_value', 15, 2);   // قيمة الضريبة المحسوبة
        $table->decimal('total_amount', 15, 2); // الإجمالي النهائي

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_invoices');
    }
};
