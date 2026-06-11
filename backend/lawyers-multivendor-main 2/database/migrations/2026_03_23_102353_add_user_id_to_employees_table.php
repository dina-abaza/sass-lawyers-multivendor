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
    Schema::table('employees', function (Blueprint $table) {
        // إضافة user_id لربط الموظف بحساب تسجيل الدخول
        $table->foreignId('user_id')->after('tenant_id')->nullable()->constrained('users')->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::table('employees', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
}
};
