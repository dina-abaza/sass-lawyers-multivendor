<?php

namespace App\Models;

use App\Traits\CheckSubscriptionLimits;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Customer extends Model
{
    use HasFactory, BelongsToTenant,CheckSubscriptionLimits ;

    protected $fillable = [
        'name', 'customer_type', 'job', 'address', 'birth_date',
        'birth_date_hijri', 'national_id', 'gender', 'phone',
        'mobile', 'email', 'status', 'notes', 'files', 'tenant_id',
    ];



    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'customer_id');
    }
    public function cases()
{
    return $this->hasMany(LegalCase::class);
}
public function contracts()
{
    return $this->hasMany(Contract::class);
}

public function legalDocuments()
{
    return $this->hasMany(LegalDocument::class, 'customer_id');
}


public function receipts()
{
    return $this->hasMany(Receipt::class);
}

}
