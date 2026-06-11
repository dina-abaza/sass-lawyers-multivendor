<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Consultation extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'customer_id',
        'consultation_type',
        'general_classification',
        'subject',
        'amount',
        'notes',
        'description',
        'response_text',
        'tenant_id',
    ];


    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function invoices()
    {
        return $this->hasMany(Consultinginvoice::class);
    }
}
