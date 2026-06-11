<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class SalarySheet extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'employee_id',
        'amount',
        'payment_method',
        'notes',
        'tenant_id',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
