<?php

namespace App\Traits;

use App\Models\TenantSubscription;

trait CheckSubscriptionLimits
{
    protected static function bootCheckSubscriptionLimits()
    {
        static::creating(function ($model) {
            $tenant = tenant();

            // جلب الاشتراك الفعال
            $activeSub = TenantSubscription::where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->where('expires_at', '>=', now())
                ->with('plan')
                ->first();

            if (!$activeSub) {
                abort(403, 'لا يوجد اشتراك فعال لإتمام هذه العملية.');
            }

            // خريطة القيود العددية فقط
            $limitsMap = [
                'App\Models\Employee'     => 'max_users',
                'App\Models\Customer'     => 'max_clients',
                'App\Models\LegalCase'    => 'max_cases',
                'App\Models\CourtSession' => 'max_sessions',
                'App\Models\Task'         => 'max_tasks',
            ];

            $modelClass = get_class($model);
            $column = $limitsMap[$modelClass] ?? null;

            if ($column) {
                $limit = $activeSub->plan->$column;
                $currentCount = $modelClass::count();

                // لو الـ limit مش 0 (غير محدود) والعدد وصل للآخر
                if ($limit > 0 && $currentCount >= $limit) {
                    abort(403, "عذراً، لقد وصلت للحد الأقصى المسموح به في باقتك ({$limit}). يرجى الترقية.");
                }
            }
        });
    }
}
