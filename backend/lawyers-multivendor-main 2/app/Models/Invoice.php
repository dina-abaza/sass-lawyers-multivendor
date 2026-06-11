<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Invoice extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'case_id',
        'amount',
        'tax_rate',
        'tax_value',
        'total_amount',
        'journal_entry_id',
        'tenant_id'
    ];

    public function case()
    {
        return $this->belongsTo(LegalCase::class, 'case_id');
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public static function createWithTax($data)
    {
        $taxPercentage = InvoiceSetting::value('tax_percentage') ?? 0;
        $amount        = $data['amount'] ?? 0;
        $taxValue      = ($amount * $taxPercentage) / 100;
        $totalAmount   = $amount + $taxValue;

        return DB::transaction(function () use ($data, $amount, $taxPercentage, $taxValue, $totalAmount) {

            // 1. إنشاء الفاتورة
            $invoice = self::create([
                'case_id'      => $data['case_id'],
                'amount'       => $amount,
                'tax_rate'     => $taxPercentage,
                'tax_value'    => $taxValue,
                'total_amount' => $totalAmount,
            ]);

            // 2. جيب الحسابات المطلوبة
            $clientAccount  = Account::where('name', 'عملاء القضايا')->first();
            $revenueAccount = Account::where('name', 'إيرادات القضايا')->first();
            $taxAccount     = Account::where('name', 'الضرائب المستحقة')->first();

            // 3. إنشاء القيد
            $entry = JournalEntry::create([
                'entry_date'   => now(),
                'description'  => 'فاتورة قضية رقم ' . $invoice->id,
                'total_amount' => $totalAmount,
            ]);

            // 4. سطور القيد
            $entry->items()->create([
                'account_id'  => $clientAccount->id,
                'debit'       => $totalAmount,
                'credit'      => 0,
                'description' => 'إجمالي فاتورة قضية',
            ]);

            $entry->items()->create([
                'account_id'  => $revenueAccount->id,
                'debit'       => 0,
                'credit'      => $amount,
                'description' => 'إيرادات قضية',
            ]);

            if ($taxValue > 0) {
                $entry->items()->create([
                    'account_id'  => $taxAccount->id,
                    'debit'       => 0,
                    'credit'      => $taxValue,
                    'description' => 'ضريبة فاتورة قضية',
                ]);
            }

            // 5. ربط القيد بالفاتورة
            $invoice->update(['journal_entry_id' => $entry->id]);

            return $invoice;
        });
    }
}
