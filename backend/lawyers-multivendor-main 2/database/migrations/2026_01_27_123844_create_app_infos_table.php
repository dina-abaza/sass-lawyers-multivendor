<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_infos', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            // اللوجو
            $table->string('logo')->nullable();

            // اسم لوحة التحكم / الشركة
            $table->string('app_name')->nullable();

            // ضريبة القيمة المضافة %
            $table->decimal('vat_percentage', 5, 2)->default(0);

            // عدد ساعات العمل
            $table->integer('working_hours')->default(8);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_infos');
    }
};
