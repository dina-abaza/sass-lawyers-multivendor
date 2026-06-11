<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class PermissionController extends Controller implements HasMiddleware
{


public static function middleware(): array
    {
        return [

            // 2. ربط الدوال بالصلاحيات المناسبة
            new Middleware('permission:view_user_roles', only: ['getAllPermissions', 'getAllRoles', 'show']),
            new Middleware('permission:create_user_role', only: ['createRole']),
            new Middleware('permission:edit_user_role', only: ['updateRole']),
            new Middleware('permission:delete_user_role', only: ['deleteRole']),
        ];
    }

    // 1. جلب الصلاحيات الثابتة لعرضها في الشاشة (صورة 1)
    public function getAllPermissions()
    {
        // جلب الصلاحيات الخاصة بالـ api فقط لضمان التوافق
        $permissions = Permission::where('guard_name', 'api')->get();
        return response()->json([
            'status' => true,
            'data' => $permissions
        ]);
    }

    // 2. إنشاء "الدور" (اسم الصلاحية في الشاشة) وربطه بالأفعال المختارة
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name', // "اسم الصلاحيات" في الصورة 1
            'permissions' => 'required|array'      // المصفوفة المختارة من الـ Checkboxes
        ]);

        // إنشاء الدور مع تحديد الـ guard ليتطابق مع الـ Seeder
        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'api'
        ]);

        // ملاحظة: syncPermissions ستبحث عن الأسماء داخل guard_name المحدد للدور تلقائياً
        $role->syncPermissions($request->permissions);

        return response()->json([
            'status' => true,
            'message' => 'تم إنشاء الدور وربط الصلاحيات بنجاح',
            'role' => $role->load('permissions')
        ], 201);
    }

    // 3. عرض جدول الأدوار (صورة 2)
    public function getAllRoles()
    {
        // مع جلب عدد الصلاحيات المرتبطة بكل دور للعرض في الجدول
        $roles = Role::where('guard_name', 'api')->withCount('permissions')->get();
        return response()->json([
            'status' => true,
            'data' => $roles
        ]);
    }


public function show($id)
{
    // بنجيب الدور ومعاه الصلاحيات المرتبطة بيه في query واحدة
    $role = Role::where('guard_name', 'api')->with('permissions')->find($id);

    if (!$role) {
        return response()->json([
            'status' => false,
            'message' => 'هذا الدور غير موجود'
        ], 404);
    }

    // بنجهز المصفوفة بأسماء الصلاحيات فقط لتسهيل التعامل معها في الـ Checkboxes
    $rolePermissions = $role->permissions->pluck('name')->toArray();

    return response()->json([
        'status' => true,
        'data' => [
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $rolePermissions, // مصفوفة بأسماء الصلاحيات
        ]
    ]);
}

   public function update(Request $request, $id)
{
    $role = Role::findOrFail($id);

    $request->validate([
        // 'sometimes' عشان مش لازم يتبعت، و الـ ignore عشان يقبل نفس الاسم لو مغيرتهوش
        'name' => 'sometimes|required|unique:roles,name,' . $id,
        'permissions' => 'required|array'
    ]);

    // بنحدث الاسم فقط لو مبعوت في الـ request
    if ($request->has('name')) {
        $role->update(['name' => $request->name]);
    }

    // بنحدث الصلاحيات (بتمسح القديم وتحط الجديد المختار)
    $role->syncPermissions($request->permissions);

    return response()->json([
        'status' => true,
        'message' => 'تم تحديث الدور وصلاحياته بنجاح',
        'role' => $role->load('permissions')
    ]);
}
    // 4. حذف الدور
   public function deleteRole($id)
{
    $role = Role::findOrFail($id);

    // 1. التأكد من وجود مستخدمين (زي ما إنتِ عاملة)
    $hasUsers = DB::table('model_has_roles')
        ->where('role_id', $role->id)
        ->exists();

    if ($hasUsers) {
        return response()->json([
            'status' => false,
            'message' => 'لا يمكن حذف الدور لأنه مرتبط بمستخدمين حاليين.'
        ], 400);
    }

    // 2. مسح الصلاحيات المرتبطة بالدور ده الأول يدوياً من الجدول الوسيط
    // ده بيخلي عملية حذف الدور أسهل ومبيخليش سباتي يحتاج يكلم موديل اليوزر
    DB::table('role_has_permissions')->where('role_id', $role->id)->delete();

    // 3. حذف الدور نفسه
    $role->delete();

    // 4. تنظيف كاش الصلاحيات يدوياً
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    return response()->json([
        'status' => true,
        'message' => 'تم حذف الدور بنجاح'
    ], 200);
}
}
