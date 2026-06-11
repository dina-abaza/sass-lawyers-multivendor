<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TenantSubscriptionController;
use App\Http\Controllers\VendorManagementController;
use Illuminate\Support\Facades\Route;


foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {

        // 1. روتات عامة (فقط على الدومين الرئيسي)
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::post('/contact-us', [ContactController::class, 'store']);


        // 2. روتات محمية
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/change-password', [AuthController::class, 'changePassword']);
            Route::post('/logout', [AuthController::class, 'logout']);



            // إدارة المنصة (للسوبر أدمن فقط)
            Route::prefix('admin')->middleware('role:super_admin')->group(function () {
                Route::get('/pending-vendors', [VendorManagementController::class, 'pendingRequests']);
                Route::post('/approve-vendor/{userId}', [VendorManagementController::class, 'approve']);
                Route::post('/reject-vendor/{userId}', [VendorManagementController::class, 'reject']);
                Route::post('/profile/update', [AuthController::class, 'AdminUpdateProfile']);

            });

            // باقات الاشتراك
            // عرض كل طلبات الاشتراك المعلقة لكل المكاتب
            Route::get('/subscriptions/status', [TenantSubscriptionController::class, 'indexByStatus']);
  // تفعيل اشتراك مكتب معين يدوياً
            Route::post('/subscriptions/{id}/activate', [TenantSubscriptionController::class, 'adminActivate']);
            // إلغاء اشتراك مكتب معين يدوياً
            Route::post('/subscriptions/{id}/cancel', [TenantSubscriptionController::class, 'adminCancel']);
            Route::get('/subscriptions/{id}/details', [TenantSubscriptionController::class, 'showSubscriptionDetails']);
        });
                    Route::apiResource('subscriptions', SubscriptionController::class);

    });
}
