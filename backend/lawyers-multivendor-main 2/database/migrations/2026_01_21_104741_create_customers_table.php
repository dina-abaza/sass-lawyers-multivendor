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
    Schema::create('customers', function (Blueprint $table) {
        $table->id();
        $table->string('tenant_id');
        $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        $table->string('name'); // الاسم
        $table->enum('customer_type', ['individual', 'company', 'organization', 'other'])
        ->nullable();
        $table->string('job')->nullable(); // المهنة
        $table->string('address')->nullable(); // العنوان
        $table->date('birth_date')->nullable(); // تاريخ الميلاد ميلادي
        $table->string('birth_date_hijri')->nullable(); // تاريخ الميلاد هجري
        $table->string('gender')->nullable(); // الجنسية/الجنس
        $table->string('phone')->nullable(); // رقم الهاتف
        $table->string('mobile')->nullable(); // رقم الجوال
        $table->string('national_id')->nullable();
        $table->unique(['national_id', 'tenant_id']);
        $table->string('email')->nullable();
        $table->unique(['email', 'tenant_id']);
       $table->enum('status', ['active', 'not_active'])->nullable(); // حالة العميل
        $table->text('notes')->nullable(); // ملاحظات
        $table->string('files')->nullable(); // المرفقات
        $table->timestamps(); // تاريخ الإنشاء والتحديث
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
