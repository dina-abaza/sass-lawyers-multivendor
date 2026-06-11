<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('court_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            // الربط
            $table->foreignId('case_id')
                  ->constrained('cases')
                  ->cascadeOnDelete();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('case_status_id')
                  ->constrained('case_statuses');

            // بيانات الجلسة
            $table->string('session_number')->nullable();
            $table->string('court_side')->nullable();
            $table->string('day')->nullable();
            $table->string('agency')->nullable();

            $table->date('date')->nullable();
            $table->string('date_hijri')->nullable();
            $table->time('session_time')->nullable();

            $table->date('reminder_date')->nullable();

            $table->text('notes')->nullable();
            $table->json('files')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_sessions');
    }
};
