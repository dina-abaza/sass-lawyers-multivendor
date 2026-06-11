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
    Schema::table('attendances', function (Blueprint $table) {
        // ضفت after('user_id') عشان ترتيب الجدول في الـ Database يكون مريح للعين
        $table->foreignId('employee_id')
              ->nullable()
              ->after('user_id')
              ->constrained('employees')
              ->onDelete('set null');
    });
}

public function down(): void
{
    Schema::table('attendances', function (Blueprint $table) {
        $table->dropForeign(['employee_id']);
        $table->dropColumn('employee_id');
    });
}
};
