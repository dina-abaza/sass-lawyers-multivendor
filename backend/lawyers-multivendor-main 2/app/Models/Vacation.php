<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Vacation extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'employee_id',
        'start_date',
        'end_date',
        'notes',
        'tenant_id',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
