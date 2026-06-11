<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('name');                 // اسم العقد
            $table->string('contract_number')->unique(); // رقم العقد

            $table->foreignId('customer_id')        // اسم العميل
                  ->constrained('customers')
                  ->cascadeOnDelete();

            $table->date('start_date');             // تاريخ بداية العقد
            $table->date('end_date')->nullable();   // تاريخ نهاية العقد

            $table->decimal('value', 12, 2)->nullable(); // قيمة العقد

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
