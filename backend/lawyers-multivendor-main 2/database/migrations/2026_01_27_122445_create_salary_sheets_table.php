<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('salary_sheets', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            // الموظف
            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            // المبلغ
            $table->decimal('amount', 12, 2);

            // طريقة الدفع
            $table->enum('payment_method', ['cash', 'bank', 'wallet']);

            // ملاحظات
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_sheets');
    }
};
