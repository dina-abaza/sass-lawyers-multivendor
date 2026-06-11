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
    Schema::create('subscriptions', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // اسم الباقة
        $table->decimal('price_monthly', 8, 2);
        $table->decimal('price_yearly', 8, 2);

        // القيود (Limits) بناءً على الصورة
        $table->integer('max_users')->default(0);
        $table->integer('max_clients')->default(0);
        $table->integer('max_cases')->default(0);
        $table->integer('max_sessions')->default(0);
        $table->integer('max_tasks')->default(0);

        // المزايا (Features)
        $table->boolean('has_templates')->default(false);
        $table->boolean('has_financial_management')->default(false);
        $table->boolean('has_attendance')->default(false);
        $table->boolean('has_lawyer_reports')->default(false);
        $table->boolean('has_notifications')->default(false);

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
