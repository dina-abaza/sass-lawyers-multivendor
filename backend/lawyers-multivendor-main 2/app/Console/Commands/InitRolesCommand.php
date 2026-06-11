<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class InitRolesCommand extends Command
{
    protected $signature = 'app:init-roles';
    protected $description = 'Initialize Spatie roles and permissions (safe to run multiple times)';

    public function handle(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_user_roles', 'create_user_role', 'edit_user_role', 'delete_user_role',
            'edit_settings', 'invoices_settings', 'access_finance_dept',
            'view_invoices', 'create_invoices', 'edit_invoices', 'delete_invoices',
            'view_vouchers', 'create_vouchers', 'edit_vouchers', 'delete_vouchers',
            'access_hr_list', 'view_employees',
            'view_cases', 'create_cases', 'edit_cases', 'delete_cases',
            'view_cases_archive', 'view_lawyer_reports',
            'view_sessions', 'create_sessions', 'edit_sessions', 'delete_sessions',
            'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
            'view_consultations', 'create_consultations', 'edit_consultations', 'delete_consultations',
            'view_wakalas', 'create_wakalas', 'edit_wakalas', 'delete_wakalas',
            'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks', 'view_archived_tasks',
            'view_documents', 'edit_documents', 'create_documents', 'delete_documents',
            'send_notifications',
            'add_case_statuses', 'view_case_statuses', 'edit_case_statuses', 'delete_case_statuses',
            'view_global_docs', 'create_global_docs', 'edit_global_docs', 'delete_global_docs',
            'access_accounting_list',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'api');
        }

        $this->info('Permissions: ' . count($permissions) . ' created/verified.');

        $roles = [
            'super_admin', 'owner', 'general_manager', 'administration', 'lawyer',
            'trainee_lawyer', 'secretary', 'legal_consultant', 'accountant', 'hr', 'user',
        ];

        foreach ($roles as $role) {
            Role::findOrCreate($role, 'api');
        }

        Role::where('name', 'owner')->where('guard_name', 'api')->first()
            ?->syncPermissions(Permission::where('guard_name', 'api')->get());

        $this->info('Roles: ' . count($roles) . ' created/verified.');
        $this->info('Owner role synced with all permissions.');
        $this->info('Done.');
    }
}
