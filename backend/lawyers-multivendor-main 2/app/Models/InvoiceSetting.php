<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class InvoiceSetting extends Model
{

    use BelongsToTenant;

    protected $fillable = [
        'office_name',
        'tax_number',
        'phone',
        'address',
        'logo',
        'tenant_id',
        'tax_percentage'
       ];

        protected $appends = ['logo_url'];

    protected function logo(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? tenant_asset($value) : null,
        );
    }

   public function getLogoUrlAttribute()
    {
        return $this->logo;
    }
}
