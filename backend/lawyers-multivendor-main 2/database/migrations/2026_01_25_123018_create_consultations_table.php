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
    Schema::create('consultations', function (Blueprint $table) {
        $table->id();
                    $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        // الربط مع العميل المختار من القائمة المنسدلة
        $table->foreignId('customer_id')->constrained('customers');

        $table->enum('consultation_type', ['oral', 'written']); // نوع الاستشارة
        $table->enum('general_classification', [
            'criminal',     // القانون الجنائي
            'commercial',   // القانون التجاري
            'civil',        // القانون المدني
            'family',       // قانون الأسرة
            'labor',        // قانون العمل
            'environmental',// قانون البيئة
            'investment',   // قانون الاستثمار (إضافة جديدة)
            'international' // القانون الدولي (إضافة جديدة)
        ]); // التصنيف العام
        $table->string('subject')->nullable(); // موضوع الاستشارة
        $table->decimal('amount', 15, 2)->default(0); // قيمة الاستشارة

        $table->text('notes')->nullable(); // ملاحظات
        $table->text('description')->nullable(); // الوصف
        $table->text('response_text')->nullable(); // الرد

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
