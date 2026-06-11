<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class JournalEntry extends Model
{
    use HasFactory , BelongsToTenant;

    protected $table = 'journal_entries';

    protected $fillable = [
        'entry_date',
        'description',
        'total_amount',
        'tenant_id',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * العلاقة مع بنود القيد (السطور)
     */
    public function items()
    {
        return $this->hasMany(JournalItem::class);
    }

    /**
     * العلاقة العكسية مع المعاملات المالية
     * JournalEntry له عدة Transactions
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
