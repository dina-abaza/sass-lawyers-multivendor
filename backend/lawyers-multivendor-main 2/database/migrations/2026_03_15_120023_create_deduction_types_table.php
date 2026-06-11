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
    Schema::create('deduction_types', function (Blueprint $table) {
        $table->id();
        $table->string('tenant_id');
        $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        $table->string('name'); // اسم الخصم
        $table->decimal('value', 8, 2); // المبلغ المخصوم
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deduction_types');
    }
};
