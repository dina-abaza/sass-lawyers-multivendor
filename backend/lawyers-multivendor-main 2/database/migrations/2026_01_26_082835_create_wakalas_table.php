<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wakalas', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('name');                    // الاسم
            $table->string('wakala_number')->unique(); // رقم الوكالة

            $table->string('wakala_date_hijri')->nullable(); // تاريخ الوكالة (هجري)

            $table->string('wakala_expiry_hijri')->nullable();     // تاريخ الانتهاء هجري

            $table->string('file')->nullable();          // ملف الوكالة

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wakalas');
    }
};
