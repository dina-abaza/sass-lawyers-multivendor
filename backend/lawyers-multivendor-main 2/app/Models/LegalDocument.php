<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class LegalDocument extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'customer_id',
        'document_type',
        'agency_number',
        'document_number',
        'description',
        'notes',
        'files',
        'tenant_id',
    ];

    protected $casts = [
        'files' => 'array',
    ];


    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
