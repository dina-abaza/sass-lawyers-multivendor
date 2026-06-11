<?php

namespace Database\Seeders;

use App\Models\Account;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountsSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // ============ 1. الأصول ============
            ['name' => 'الأصول',                'status' => 'debitor',  'parent_id' => null],
            ['name' => 'الأصول المتداولة',       'status' => 'debitor',  'parent_id' => 1],
            ['name' => 'الصندوق',               'status' => 'debitor',  'parent_id' => 2],
            ['name' => 'البنك',                 'status' => 'debitor',  'parent_id' => 2],
            ['name' => 'العملاء',               'status' => 'debitor',  'parent_id' => 2],
            ['name' => 'عملاء القضايا',         'status' => 'debitor',  'parent_id' => 5],
            ['name' => 'عملاء العقود',          'status' => 'debitor',  'parent_id' => 5],
            ['name' => 'عملاء الاستشارات',      'status' => 'debitor',  'parent_id' => 5],

            // ============ 2. الخصوم ============
            ['name' => 'الخصوم',                'status' => 'creditor', 'parent_id' => null],
            ['name' => 'الضرائب المستحقة',      'status' => 'creditor', 'parent_id' => 9],

            // ============ 3. الإيرادات ============
            ['name' => 'الإيرادات',             'status' => 'creditor', 'parent_id' => null],
            ['name' => 'إيرادات القضايا',       'status' => 'creditor', 'parent_id' => 11],
            ['name' => 'إيرادات العقود',        'status' => 'creditor', 'parent_id' => 11],
            ['name' => 'إيرادات الاستشارات',    'status' => 'creditor', 'parent_id' => 11],

            // ============ 4. المصروفات ============
            ['name' => 'المصروفات',             'status' => 'debitor',  'parent_id' => null],
            ['name' => 'مصروفات الرواتب',       'status' => 'debitor',  'parent_id' => 15],
            ['name' => 'مصروفات عامة',          'status' => 'debitor',  'parent_id' => 15],
        ];

        // جيب كل الـ tenants
        $tenants = DB::table('tenants')->pluck('id');

        foreach ($tenants as $tenantId) {
            // ادخل جوا الـ tenant
            tenancy()->initialize($tenantId);

            $createdIds = [];

            foreach ($accounts as $index => $account) {
                // لو فيه parent_id → جيب الـ id الحقيقي اللي اتعمل
                if ($account['parent_id'] !== null) {
                    $account['parent_id'] = $createdIds[$account['parent_id'] - 1];
                }

                $created = Account::create($account);
                $createdIds[] = $created->id;
            }

            tenancy()->end();
        }

        $this->command->info('✅ تم إنشاء شجرة الحسابات لكل tenant بنجاح!');
    }
}
