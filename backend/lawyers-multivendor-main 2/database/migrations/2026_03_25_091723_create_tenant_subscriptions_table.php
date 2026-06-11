<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
                        $table->foreignId('subscription_id')->constrained()->onDelete('cascade');

            $table->date('starts_at')->nullable(); // بيبقى null لحد ما يدفع
            $table->date('expires_at')->nullable(); // بيبقى null لحد ما يدفع
            $table->enum('type', ['monthly', 'yearly'])->default('monthly');
            $table->enum('status', ['active', 'expired', 'pending', 'canceled'])->default('pending');
            $table->string('payment_transaction_id')->nullable(); // لحفظ رقم العملية من بوابة الدفع
            $table->decimal('amount_paid', 10, 2)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_subscriptions');
    }
};
