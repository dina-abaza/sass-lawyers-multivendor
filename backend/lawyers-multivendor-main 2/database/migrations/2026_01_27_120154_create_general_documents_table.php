<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('general_documents', function (Blueprint $table) {
            $table->id();
                        $table->string('tenant_id');
           $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('file_type');
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            // الملفات المرفقة (Array JSON)
            $table->json('files')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('general_documents');
    }
};
