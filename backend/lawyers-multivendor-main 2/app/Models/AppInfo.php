<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class AppInfo extends Model
{
    use HasFactory ,BelongsToTenant;

    protected $fillable = [
        'logo',
        'app_name',
        'working_hours',
         'tenant_id',
    ];

    protected function logo(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? tenant_asset($value) : null,
        );
    }
}

