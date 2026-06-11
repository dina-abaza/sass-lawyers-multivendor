<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            // العميل
            $table->foreignId('customer_id')
                ->constrained()
                ->cascadeOnDelete();

            // تاريخ السند
            $table->date('receipt_date');
            // تاريخ هجري (نص)
            $table->string('receipt_date_hijri')->nullable();
            // المبلغ
            $table->decimal('amount', 12, 2);
            // المبلغ كتابة
            $table->string('amount_text');

            // طريقة الدفع
            $table->boolean('is_check')->default(false);
            // البنك (لو شيك)
            $table->string('bank')->nullable();
            $table->text('for_reason')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
