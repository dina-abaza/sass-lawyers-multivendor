<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Stancl\Tenancy\Models\Tenant; // تأكدي من مسار الموديل حسب حزمتك

class VendorManagementController extends Controller implements HasMiddleware
{
    public static function middleware():array{
        return [
           'auth:sanctum',
            new Middleware('role:super_admin'),
        ];
    }
    /**
     * عرض جميع طلبات المكاتب (المحامين) التي تنتظر الموافقة
     */
    public function pendingRequests()
    {
        // نستخدم withoutTenancy لأن الطلبات الجديدة ليس لها tenant_id بعد
        $requests = User::withoutTenancy()
            ->where('status', 'pending')
            ->whereNotNull('requested_tenant_name')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $requests
        ]);
    }

    /**
     * الموافقة على طلب مكتب وتفعيل الـ Vendor
     */
    public function approve($userId)
    {
        $user = User::withoutTenancy()->findOrFail($userId);

        if ($user->status !== 'pending') {
            return response()->json(['message' => 'هذا الطلب تمت معالجته مسبقاً'], 400);
        }

        // 1. إنشاء الـ Tenant (المكتب) في قاعدة البيانات
        $tenant = \App\Models\Tenant::create([
            'id' => $user->requested_tenant_name,
        ]);
    $domain = $user->requested_tenant_name ;
        $tenant->domains()->create([
            'domain' => $domain, // مثلاً: nabil-law.api-lawyers.abdaealmasi.com
        ]); // تأكدي من أن الحقل في جدول domains هو 'domain' وليس 'name' أو غيره
    // سيصبح مثلاً: nabil-law.api-lawyers.abdaealmasi.store


        // 2. تحديث بيانات المستخدم وربطه بالمكتب وتفعيل حسابه
        $user->update([
            'tenant_id' => $tenant->id,
            'status' => 'approved',
            'domain' => $domain,
        ]);

        // 3. تعيين دور الأدمن له (Admin of his own office)
        // تأكدي أن رول 'admin' موجود في السيستم عندك
        if (method_exists($user, 'syncRoles')) {
            $user->syncRoles(['owner']);
        }

        return response()->json([
            'status' => true,
            'message' => 'تم تفعيل مكتب المحاماة بنجاح، ويمكن للمستخدم الدخول الآن.'
        ]);
    }

    /**
     * رفض طلب مكتب
     */
    public function reject($userId)
    {
        $user = User::withoutTenancy()->findOrFail($userId);

        $user->update([
            'status' => 'rejected'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'تم رفض طلب إنشاء المكتب.'
        ]);
    }
}
