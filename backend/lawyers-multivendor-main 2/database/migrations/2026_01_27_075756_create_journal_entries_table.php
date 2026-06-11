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
   Schema::create('journal_entries', function (Blueprint $table) {
    $table->id();
    $table->string('tenant_id');
    $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
    $table->date('entry_date');
    $table->string('description')->nullable();
    $table->decimal('total_amount', 12, 2)->default(0);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
