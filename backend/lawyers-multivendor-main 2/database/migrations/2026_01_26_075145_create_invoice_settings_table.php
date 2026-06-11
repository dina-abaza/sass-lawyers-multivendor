<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('invoice_settings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('office_name');                 // اسم المكتب
            $table->string('tax_number')->nullable();      // الرقم الضريبي
            $table->decimal('tax_percentage', 5, 2);      // نسبة الضريبة (مثال: 14.00)
            $table->string('phone')->nullable();           // رقم الهاتف
            $table->string('address')->nullable();         // العنوان
            $table->string('logo')->nullable();            // مسار اللوجو

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_settings');
    }
};
