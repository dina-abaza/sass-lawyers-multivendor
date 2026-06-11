<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cases', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('case_number')->unique();        // رقم القضية
            $table->string('agency')->nullable();           // الجهة
            $table->string('office')->nullable();           // الدائرة / المكتب
            $table->string('type')->nullable();             // نوع الدعوى
$table->foreignId('contract_id')
      ->nullable()
      ->constrained('contracts')
      ->nullOnDelete();

            $table->foreignId('user_id')                     // المحامي المكلف
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('customer_id')                 // العميل
                  ->constrained()
                  ->cascadeOnDelete();

            $table->decimal('value', 12, 2)->nullable();     // قيمة الدعوى
            $table->string('subject')->nullable();           // موضوع الدعوى

            $table->foreignId('case_status_id')               // حالة القضية
                  ->constrained('case_statuses');

            $table->string('opponent_name')->nullable();     // اسم الخصم

            $table->date('date')->nullable();                // تاريخ الدعوى (ميلادي)
            $table->string('date_hijri')->nullable();        // تاريخ الدعوى (هجري)

            $table->text('notes')->nullable();               // ملاحظات

            $table->json('files')->nullable();               // ملفات مرفقة (أكتر من ملف)

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cases');
    }
};
