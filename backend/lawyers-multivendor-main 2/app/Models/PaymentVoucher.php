<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class PaymentVoucher extends Model
{
    use HasFactory, BelongsToTenant;

  protected $fillable = [
    'customer_id',
    'voucher_date',
    'voucher_date_hijri',
    'amount',
    'amount_text',
    'is_check',
    'bank',
    'for_reason',
    'notes',
    'journal_entry_id',
    'tenant_id',
];

public function journalEntry()
{
    return $this->belongsTo(JournalEntry::class);
}

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
