<?php

declare(strict_types=1);

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AccountStatementController;
use App\Http\Controllers\AppInfoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaseStatusController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\ConsultinginvoiceController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\ContractInvoiceController;
use App\Http\Controllers\CourtSessionController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DeductionSheetController;
use App\Http\Controllers\DeductionTypeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\GeneralDocumentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceSettingController;
use App\Http\Controllers\JournalEntryController;
use App\Http\Controllers\LegalCaseController;
use App\Http\Controllers\LegalDocumentController;
use App\Http\Controllers\MissionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentVoucherController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\SalarySheetController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TenantSubscriptionController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TrialBalanceController;
use App\Http\Controllers\VacationController;
use App\Http\Controllers\WakalaController;
use App\Http\Controllers\WorkLocationController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyBySubdomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;



Route::middleware([
    'api',
    InitializeTenancyBySubdomain::class,
    PreventAccessFromCentralDomains::class,
    'auth:sanctum', // المحامي وموظفيه لازم يكونوا مسجلين دخول
])->prefix('api')->group(function () {

    Route::post('/profile/update', [AuthController::class, 'updateProfile']);

    Route::post('/change-password', [AuthController::class, 'changePassword']);
    // طلب اشتراك جديد للمكتب الحالي
    Route::post('/my-subscription/request', [TenantSubscriptionController::class, 'requestSubscription']);
    // عرض حالة الاشتراك الحالية للمكتب والمزايا
    Route::get('/my-subscription/status', [TenantSubscriptionController::class, 'currentStatus']);
    Route::post('/send-staff-message', [EmployeeController::class, 'sendMessageToStaff']);
    Route::post('/send-direct-message', [EmployeeController::class, 'sendMessageToSpecificEmployee']);

    Route::middleware(['check.sub'])->group(function () {
        Route::get('/app-info', [AppInfoController::class, 'index']);
        // روت التحديث متاح فقط لـ "المالك"
        Route::post('/app-info', [AppInfoController::class, 'update'])
            ->middleware('role:owner');

        // 1. إدارة الموظفين والحضور (داخل المكتب)
        Route::prefix('attendance')->group(function () {
            Route::post('/check-in', [AuthController::class, 'checkIn']);
            Route::post('/check-out', [AuthController::class, 'checkOut']);
            Route::get('/', [AuthController::class, 'attendanceIndex']);
        });

        Route::post('/logout', [AuthController::class, 'logout']);


        // 2. إدارة مستخدمي المكتب (أدمن المكتب يضيف موظفينه)
        Route::prefix('admin')->group(function () {
            Route::post('/users/store', [AuthController::class, 'adminStoreUser']);
            Route::get('/users', [AuthController::class, 'index']);
            Route::get('/users/{id}', [AuthController::class, 'show']);
            Route::put('/users/{id}', [AuthController::class, 'update']);
            Route::delete('/users/{id}', [AuthController::class, 'destroy']);
        });

        // 3. القضايا والعملاء والجلسات
        Route::apiResource('customers', CustomerController::class);




        //LegalCaseController

        Route::apiResource('cases', LegalCaseController::class)
            ->only(['index', 'store', 'show', 'destroy']);
        Route::get('cases-archive', [LegalCaseController::class, 'archiveCases']);
        Route::post('cases-updated/{id}', [LegalCaseController::class, 'update']);
        //تقارير المحامييون
        Route::prefix('lawyers')->group(function () {
            Route::get('/', [LegalCaseController::class, 'getAllLawyers']);
            Route::get('/{id}', [LegalCaseController::class, 'getLawyerById']);
        });



        Route::apiResource('sessions', CourtSessionController::class)->except(['update']);
        Route::post('sessions/{id}', [CourtSessionController::class, 'update']);
        Route::apiResource('case-statuses', CaseStatusController::class);
        Route::apiResource('consultations', ConsultationController::class);
        Route::apiResource('wakalas', WakalaController::class);

        // 4. الفواتير والماليات (خاصة بالمكتب)
        Route::get('/invoice-settings', [InvoiceSettingController::class, 'show']);
        Route::post('/invoice-settings', [InvoiceSettingController::class, 'storeOrUpdate']);
        Route::apiResource('invoices', InvoiceController::class);
        Route::apiResource('contract-invoices', ContractInvoiceController::class);
        Route::apiResource('consulting-invoices', ConsultinginvoiceController::class);  // الفواتير
        Route::apiResource('receipts', ReceiptController::class);
        Route::apiResource('payment-vouchers', PaymentVoucherController::class);
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::apiResource('journal-entries', JournalEntryController::class);

        // 5. شؤون الموظفين والرواتب
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('employees', EmployeeController::class);
        Route::apiResource('salary-sheets', SalarySheetController::class);
        Route::apiResource('vacations', VacationController::class);

        // 6. المهام والعقود والمستندات
        Route::apiResource('tasks', TaskController::class);
        Route::get('tasks-archive', [TaskController::class, 'archivetasks']);
        Route::apiResource('contracts', ContractController::class);
        Route::apiResource('accounts', AccountController::class);
        Route::apiResource('legal-documents', LegalDocumentController::class)->except('update');
        Route::post('legal-documents/{legalDocument}', [LegalDocumentController::class, 'update']);
        Route::delete('legal-documents/{legalDocument}/files/{index}', [LegalDocumentController::class, 'deleteFile']);
        Route::apiResource('general-documents', GeneralDocumentController::class)->except(['update']);
        Route::post('general-documents/{generalDocument}', [GeneralDocumentController::class, 'update']);
        Route::delete('general-documents/{generalDocument}/files/{index}', [GeneralDocumentController::class, 'deleteFile']);

        // 7. الصلاحيات والإشعارات (داخل المكتب)
        Route::get('/permissions', [PermissionController::class, 'getAllPermissions']);
        Route::get('/roles', [PermissionController::class, 'getAllRoles']);
        Route::apiResource('roles', PermissionController::class)->except(['index']); // CRUD للـ Roles

        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/send', [NotificationController::class, 'send']);
            Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
            Route::delete('/delete-all', [NotificationController::class, 'destroyAll']);
            Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
        });
        // إدارة أنواع الخصومات

        Route::apiResource('deduction-types', DeductionTypeController::class);
        Route::apiResource('deductions', DeductionSheetController::class);
        Route::apiResource('work-locations', WorkLocationController::class);

        // مأموريات الموظفين
        Route::get('missions', [MissionController::class, 'index']);
    });
    Route::get('subscriptions', [SubscriptionController::class, 'index']);
    // تقرير ميزان المراجعة
    Route::get('trial-balance', [TrialBalanceController::class, 'index']);
    Route::get('account-statement', [AccountStatementController::class, 'index']);
});
