<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Transaction extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'transactions';

    protected $fillable = [
        'journal_entry_id',
        'tenant_id',
    ];

    /**
     * العلاقة مع قيد اليومية
     * Transaction ينتمي إلى JournalEntry
     */
    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }
}
