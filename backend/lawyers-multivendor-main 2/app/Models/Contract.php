<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Contract extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'name',
        'contract_number',
        'customer_id',
        'start_date',
        'end_date',
        'value',
        'tenant_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    // 🔗 العلاقات
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
    public function cases()
{
    return $this->hasMany(LegalCase::class);
}

public function invoices()
    {
        return $this->hasMany(ContractInvoice::class, 'contract_id');
    }
}
