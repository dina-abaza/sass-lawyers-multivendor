<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SubscriptionController extends Controller implements HasMiddleware
{
    /**
     * تعريف الـ Middleware الخاص بالكنترولر (Laravel 11 Style)
     */
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show']),
            // تشغيل صلاحية super_admin على كل العمليات ما عدا العرض
            new Middleware('role:super_admin', except: ['index', 'show']),
        ];
    }

    /**
     * عرض كل الباقات المتاحة
     */
    public function index()
    {
        $subscriptions = Subscription::all();
        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ], 200);
    }

    /**
     * إنشاء باقة جديدة (خاص بالسوبر أدمن فقط)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                      => 'required|string|max:255|unique:subscriptions,name',
            'price_monthly'             => 'required|numeric|min:0',
            'price_yearly'              => 'required|numeric|min:0',
            'trial_days'                => 'required|integer|min:0',
            'max_users'                 => 'required|integer|min:0',
            'max_clients'               => 'required|integer|min:0',
            'max_cases'                 => 'required|integer|min:0',
            'max_sessions'              => 'required|integer|min:0',
            'max_tasks'                 => 'required|integer|min:0',
            'has_templates'             => 'boolean',
            'has_financial_management'  => 'boolean',
            'has_attendance'            => 'boolean',
            'has_lawyer_reports'        => 'boolean',
            'has_notifications'         => 'boolean',
        ]);

        $subscription = Subscription::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الباقة بنجاح',
            'data'    => $subscription
        ], 201);
    }

    /**
     * عرض تفاصيل باقة معينة
     */
    public function show(Subscription $subscription)
    {
        return response()->json([
            'success' => true,
            'data'    => $subscription
        ], 200);
    }

    /**
     * تحديث بيانات باقة (خاص بالسوبر أدمن فقط)
     */
    public function update(Request $request, Subscription $subscription)
    {
        $validated = $request->validate([
            'name'                      => 'sometimes|string|max:255|unique:subscriptions,name,' . $subscription->id,
            'price_monthly'             => 'sometimes|numeric|min:0',
            'price_yearly'              => 'sometimes|numeric|min:0',
            'trial_days'                => 'sometimes|integer|min:0',
            'max_users'                 => 'sometimes|integer|min:0',
            'max_clients'               => 'sometimes|integer|min:0',
            'max_cases'                 => 'sometimes|integer|min:0',
            'max_sessions'              => 'sometimes|integer|min:0',
            'max_tasks'                 => 'sometimes|integer|min:0',
            'has_templates'             => 'boolean',
            'has_financial_management'  => 'boolean',
            'has_attendance'            => 'boolean',
            'has_lawyer_reports'        => 'boolean',
            'has_notifications'         => 'boolean',
        ]);

        $subscription->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الباقة بنجاح',
            'data'    => $subscription
        ], 200);
    }

    /**
     * حذف باقة (خاص بالسوبر أدمن فقط)
     */
    public function destroy(Subscription $subscription)
    {
        $subscription->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الباقة بنجاح'
        ], 200);
    }
}
