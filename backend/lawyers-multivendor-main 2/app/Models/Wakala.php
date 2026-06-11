<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Wakala extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'name',
        'wakala_number',
        'wakala_date_hijri',
        'wakala_expiry_hijri',
        'file',
        'tenant_id',
    ];

    protected function file(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? tenant_asset($value) : null,
        );
    }
}
