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
        Schema::create('deduction_sheets', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreignId('deduction_type_id')->constrained('deduction_types')->onDelete('cascade'); // نوع الخصم
            $table->foreignId('attendance_id')->constrained('attendances')->onDelete('cascade'); // الحضور المرتبط بالخصم
            $table->string('reason')->nullable(); // سبب الخصم
            $table->decimal('salary_after_deduction', 8, 2); // الراتب بعد الخصم
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deduction_sheets');
    }
};
