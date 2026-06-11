<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vacations', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            // الموظف
            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            // تاريخ بداية العطلة
            $table->date('start_date');

            // تاريخ نهاية العطلة
            $table->date('end_date');

            // ملاحظات
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacations');
    }
};
