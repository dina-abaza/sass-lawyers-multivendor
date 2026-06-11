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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            // الربط مع جدول القضايا
            $table->foreignId('case_id')
                ->constrained('cases')
                ->cascadeOnDelete();

            $table->decimal('amount', 15, 2);        // قيمة الأتعاب
            $table->decimal('tax_rate', 5, 2);       // نسبة الضريبة
            $table->decimal('tax_value', 15, 2);     // قيمة الضريبة
            $table->decimal('total_amount', 15, 2);  // الإجمالي

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
