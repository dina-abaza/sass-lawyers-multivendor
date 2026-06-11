<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Receipt extends Model
{
    use HasFactory, BelongsToTenant;

protected $fillable = [
    'customer_id',
    'receipt_date',
    'receipt_date_hijri',
    'amount',
    'amount_text',
    'is_check',
    'bank',
    'for_reason',
    'notes',
    'journal_entry_id',
    'tenant_id',
];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function journalEntry()
{
    return $this->belongsTo(JournalEntry::class);
}
}
