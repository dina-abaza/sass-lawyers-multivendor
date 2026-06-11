<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('legal_documents', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            // العميل
            $table->foreignId('customer_id')
                ->constrained()
                ->cascadeOnDelete();
            // نوع الوثيقة
            $table->enum('document_type', [
                'general_agency',     // وكالة عامة
                'special_agency',     // وكالة خاصة
                'periodic_agency',    // وكالة دورية - عدلية
                'declaration',        // إقرار
                'debt_settlement',    // سداد دين منظم
                'legal_pledge',       // تعهد عدلي
                'ownership_deed',     // صك ملكية
                'other',              // أخرى
            ]);
            // رقم الوكالة
            $table->string('agency_number')->nullable();
            // رقم الوثيقة
            $table->string('document_number')->unique();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->json('files')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_documents');
    }
};
