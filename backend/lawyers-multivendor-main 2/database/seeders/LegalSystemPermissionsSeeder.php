<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class LegalSystemPermissionsSeeder extends Seeder
{
    public function run()
    {
        // تنظيف الكاش الخاص بسباتي لضمان تفعيل التعديلات فوراً
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // القائمة مرتبة بناءً على الأعمدة من اليمين إلى اليسار
        $permissions = [

            // إدارة المستخدمين والصلاحيات
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            'view_user_roles',
            'create_user_role',
            'edit_user_role',
            'delete_user_role',

            // الإعدادات والمالية
            'edit_settings',
            'invoices_settings',
            'access_finance_dept',
            'view_invoices',
            'create_invoices',
            'edit_invoices',
            'delete_invoices',
            'view_vouchers',
            'create_vouchers',
            'edit_vouchers',
            'delete_vouchers',

            // الموارد البشرية والموظفين
            'access_hr_list',

            'view_employees',

            // القضايا والجلسات (جديد بناءً على الروت)
            'view_cases',
            'create_cases',
            'edit_cases',
            'delete_cases',
            'view_cases_archive',
            'view_lawyer_reports',
            'view_sessions',
            'create_sessions',
            'edit_sessions',
            'delete_sessions',

            // العملاء والاستشارات
            'view_customers',
            'create_customers',
            'edit_customers',
            'delete_customers',
            'view_consultations',
            'create_consultations',
            'edit_consultations',
            'delete_consultations',

            // الوكالات والمستندات والمهام
            'view_wakalas',
            'create_wakalas',
            'edit_wakalas',
            'delete_wakalas',
            'view_tasks',
            'create_tasks',
            'edit_tasks',
            'delete_tasks',
            'view_archived_tasks',
            'view_documents',
            'edit_documents',
            'create_documents',
            'delete_documents',
            'send_notifications',

            // إدارة القضايا (حالات القضية)
            'add_case_statuses',
            'view_case_statuses',
            'edit_case_statuses',
            'delete_case_statuses',

            //الوثائق العامة
            'view_global_docs',
            'create_global_docs',
            'edit_global_docs',
            'delete_global_docs',

            //الحسابات
            'access_accounting_list',
        ];


        foreach ($permissions as $permission) {
            // استخدام findOrCreate لضمان عدم التكرار وتحديد guard_name كـ api
            Permission::findOrCreate($permission, 'api');
        }
    }
}
