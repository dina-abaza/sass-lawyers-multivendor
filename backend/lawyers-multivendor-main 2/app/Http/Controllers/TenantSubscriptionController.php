<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\TenantSubscription;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TenantSubscriptionController extends Controller implements HasMiddleware
{
    /**
     * تعريف الصلاحيات والـ Middleware
     */
    public static function middleware(): array
    {
        return [
            // الكل لازم يكون عامل تسجيل دخول
            new Middleware('auth:sanctum'),

            // السوبر أدمن فقط هو اللي يشوف "كل الطلبات المعلقة" و "يفعل يدوياً"
            new Middleware('role:super_admin', only: ['indexByStatus', 'adminActivate', 'adminCancel', 'showSubscriptionDetails']),
        ];
    }

    /**
     * [خاص بالسوبر أدمن]
     * عرض الاشتراكات بناءً على الحالة المرسلة (pending, active, canceled, etc.)
     */
    public function indexByStatus(Request $request)
    {
        $status = $request->query('status');
        $query = TenantSubscription::withoutTenancy()
            ->with(['plan', 'tenant'])
            ->latest();
        if ($status) {
            $query->where('status', $status);
        }

        $subscriptions = $query->get();

        return response()->json([
            'success' => true,
            'status'  => $status ?? 'all', // عشان تعرفي الأدمن هو شايف إيه دلوقتي
            'count'   => $subscriptions->count(),
            'data'    => $subscriptions
        ], 200);
    }
    /**
     * [خاص بالمحامي / Tenant]
     * تقديم طلب اشتراك جديد (تكون حالته Pending حتى يتم الدفع)
     */
    public function requestSubscription(Request $request)
    {
        $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id',
            'type'            => 'required|in:monthly,yearly',
        ]);

        $plan = Subscription::findOrFail($request->subscription_id);

        // 1. التحقق من وجود أي اشتراك فعال (سواء تجريبي أو مدفوع)
        $currentActive = TenantSubscription::where('status', 'active')
            ->where('expires_at', '>', now())
            ->first();

        if ($currentActive) {
            return response()->json([
                'success' => false,
                'message' => 'لديك اشتراك فعال بالفعل ينتهي في ' . $currentActive->expires_at->toDateString(),
            ], 400);
        }

        if ($plan->trial_days > 0) {
            $hasUsedTrialBefore = TenantSubscription::where('amount_paid', 0)->exists();
            if ($hasUsedTrialBefore) {
                return response()->json([
                    'success' => false,
                    'message' => 'عذراً، لقد استنفدت حقك في الفترة التجريبية لهذا المكتب سابقاً.'
                ], 400);
            }
            $tenantSubscription = TenantSubscription::create([
                'subscription_id' => $plan->id,
                'tenant_id'       => tenant('id'),
                'type'            => $request->type,
                'amount_paid'     => 0,
                'starts_at'       => now(),
                'expires_at'      => now()->addDays($plan->trial_days),
                'status'          => 'active',
                'notes'           => 'تفعيل تلقائي للفترة التجريبية'
            ]);

            return response()->json([
                'success' => true,
                'message' => "مبروك! تم تفعيل الفترة التجريبية بنجاح لمدة {$plan->trial_days} يوم.",
                'data'    => $tenantSubscription
            ], 201);
        }

        $price = ($request->type === 'monthly') ? $plan->price_monthly : $plan->price_yearly;

        $tenantSubscription = TenantSubscription::create([
            'subscription_id' => $plan->id,
            'tenant_id'       => tenant('id'),
            'type'            => $request->type,
            'amount_paid'     => $price,
            'status'          => 'pending',
            'notes'           => 'بانتظار التفعيل اليدوي بعد الدفع'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'عفواً، لا توجد فترة تجريبية لهذه الباقة. تم تقديم طلب الاشتراك بنجاح، بانتظار التفعيل من قبل الإدارة.',
            'data'    => $tenantSubscription
        ], 201);
    }

    /**
     * [خاص بالسوبر أدمن]
     * تفعيل الاشتراك يدوياً (كاش / تحويل بنكي خارج النظام)
     */
    public function adminActivate(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|string', // مثال: cash, vodafone_cash, bank
            'notes'          => 'nullable|string',
        ]);

        // نستخدم withoutTenancy عشان السوبر أدمن يقدر يوصل للسجل أياً كان الـ Tenant
        $subscription = TenantSubscription::withoutTenancy()->findOrFail($id);

        if ($subscription->status === 'active') {
            return response()->json(['success' => false, 'message' => 'هذا الاشتراك مفعل بالفعل.'], 400);
        }

        // حساب تاريخ الانتهاء بناءً على الـ type المخزن في السجل
        $expiresAt = ($subscription->type === 'yearly') ? now()->addYear() : now()->addMonth();

        $subscription->update([
            'status'                 => 'active',
            'starts_at'              => now(),
            'expires_at'             => $expiresAt,
            'payment_transaction_id' => 'MANUAL-' . strtoupper(uniqid()),
            'notes'                  => "Payment Method: {$request->payment_method}. Admin Notes: {$request->notes}"
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل الاشتراك بنجاح.',
            'expires_at' => $expiresAt->toDateString()
        ], 200);
    }



    /**
     * [خاص بالسوبر أدمن]
     * إيقاف/إلغاء اشتراك المكتب فوراً
     */
    public function adminCancel(Request $request, $id)
    {
        $subscription = TenantSubscription::withoutTenancy()->findOrFail($id);

        // التحقق لمنع التكرار: لو هو ملغي أصلاً متعملش حاجة
        if ($subscription->status === 'canceled') {
            return response()->json([
                'success' => false,
                'message' => 'هذا الاشتراك ملغى بالفعل، لا يمكن إلغاؤه مرة أخرى.'
            ], 400);
        }

        $request->validate([
            'notes' => 'required|string|min:3',
        ]);

        // باقي الكود بتاعك...
        $newLog = "--- \n[ACTION: CANCELED] BY ADMIN \nDate: " . now()->toDateTimeString() . " \nReason: " . $request->notes;

        $subscription->update([
            'status'     => 'canceled',
            'expires_at' => now(),
            'notes'      => $subscription->notes . "\n" . $newLog
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إلغاء الاشتراك بنجاح.',
            'reason' => $request->notes,
            'expires_at' => now()->toDateString(),
        ], 200);
    }


    /**
     * [خاص بالمحامي / Tenant]
     * عرض حالة الاشتراك الحالي والمزايا المتاحة له
     */
    public function currentStatus()
    {
        // الفلترة بتتم تلقائياً بناءً على الـ Tenant الحالي
        $current = TenantSubscription::with('plan')
            ->where('status', 'active')
            ->where('expires_at', '>=', now())
            ->latest()
            ->first();

        if (!$current) {
            return response()->json([
                'subscribed' => false,
                'message'    => 'لا يوجد اشتراك فعال حالياً.'
            ], 200);
        }

        return response()->json([
            'subscribed' => true,
            'data'       => $current
        ], 200);
    }



    /**
     * [خاص بالسوبر أدمن]
     * عرض تفاصيل سجل اشتراك محدد بالـ ID مع رسالة توضيحية للحالة
     */
    public function showSubscriptionDetails($id)
    {
        // البحث عن السجل بالـ ID
        $subscription = TenantSubscription::withoutTenancy()
            ->with(['plan'])
            ->findOrFail($id);

        // التحقق من الحالة والتاريخ
        $isActive = ($subscription->status === 'active' && $subscription->expires_at >= now());

        // تحديد الرسالة بناءً على الحالة
        $message = $isActive
            ? 'هذا الاشتراك فعال وصلاحيته سارية.'
            : 'هذا الاشتراك غير فعال (إما ملغى أو منتهي الصلاحية).';

        return response()->json([
            'success'   => true,
            'is_active' => $isActive,
            'message'   => $message, // الرسالة اللي طلبتيها
            'data'      => $subscription
        ], 200);
    }
}
