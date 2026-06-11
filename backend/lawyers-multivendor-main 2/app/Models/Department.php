<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Department extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'name_ar',
        'name_en',
        'tenant_id',
    ];

    public function employees()
{
    return $this->hasMany(Employee::class);
}

}
