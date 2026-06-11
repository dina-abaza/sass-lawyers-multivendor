<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\TenantSubscription;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantSubscription
{
    /**
     * التحقق من وجود اشتراك فعال وصلاحيته
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. البحث عن آخر اشتراك فعال للمكتب الحالي
        // بفضل BelongsToTenant الفلترة بتتم تلقائياً على التينانت الحالي
        $subscription = TenantSubscription::where('status', 'active')
            ->where('expires_at', '>=', now()) // لازم تاريخ الانتهاء يكون في المستقبل
            ->first();

        // 2. لو مفيش اشتراك فعال أو التاريخ خلص
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'error'   => 'subscription_expired',
                'message' => 'عذراً، اشتراكك انتهى أو غير مفعل. يرجى التجديد للوصول إلى النظام.'
            ], 403); // كود 403 يعني Forbidden (غير مسموح)
        }

        // 3. لو كله تمام، كمل الطلب عادي
        return $next($request);
    }
}
