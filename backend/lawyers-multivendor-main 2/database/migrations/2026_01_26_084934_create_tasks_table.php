<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            // الربط
            $table->foreignId('employee_id')
                  ->constrained('employees')
                  ->cascadeOnDelete();

            $table->foreignId('case_id')
                  ->nullable()
                  ->constrained('cases')
                  ->nullOnDelete();

            // بيانات المهمة
            $table->string('name'); // اسم المهمة

            $table->enum('type', ['internal', 'external']);
            // داخلي / خارجي

            $table->enum('status', ['active', 'completed', 'archived']);
            // نشط / منتهي / أرشيف

            $table->date('date')->nullable();         // تاريخ المهمة
            $table->string('date_hijri')->nullable(); // تاريخ هجري
            $table->time('time')->nullable();         // وقت المهمة

            $table->text('notes')->nullable();        // ملاحظات

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
