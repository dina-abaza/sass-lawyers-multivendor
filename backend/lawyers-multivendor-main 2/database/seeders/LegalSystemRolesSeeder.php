<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class LegalSystemRolesSeeder extends Seeder
{
    public function run()
    {
        // 1. تنظيف الكاش
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. تعريف الرولز
        $roles = [
            'super_admin'      => 'مشرف عام',
            'owner'            => 'مالك',
            'general_manager'  => 'محامي / مدير عام',
            'administration'   => 'الإدارة',
            'lawyer'           => 'محامي',
            'trainee_lawyer'   => 'محامي متدرب',
            'secretary'        => 'سكرتارية',
            'legal_consultant' => 'مستشار قانوني',
            'accountant'       => 'محاسب',
            'hr'               => 'موارد بشرية',
            'user'             => 'مستخدم عادي',
        ];

        foreach ($roles as $slug => $arabicName) {
            Role::findOrCreate($slug, 'api');
        }

        // 3. السوبر أدمن: (رول فقط بدون أي Permission)
        $superAdminRole = Role::where('name', 'super_admin')->where('guard_name', 'api')->first();
        if ($superAdminRole) {
            $superAdminRole->syncPermissions([]);
        }

        // 4. الأونر (المالك): نعطيه كل الصلاحيات التي تم إنشاؤها في LegalSystemPermissionsSeeder
        $ownerRole = Role::where('name', 'owner')->where('guard_name', 'api')->first();
        if ($ownerRole) {
            // جلب كل الصلاحيات الموجودة حالياً في جدول Permissions
            $allPermissions = Permission::where('guard_name', 'api')->get();

            // ربطها بالأونر
            $ownerRole->syncPermissions($allPermissions);
        }
    }
}
