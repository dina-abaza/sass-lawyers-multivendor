<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class JournalItem extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'journal_items';

    protected $fillable = [
        'journal_entry_id',
        'account_id',
        'debit',
        'credit',
        'description',
        'tenant_id',
    ];

    protected $casts = [
        'debit'  => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    /**
     * ربط السطر برأس القيد
     */
    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    /**
     * ربط السطر بالحساب
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
