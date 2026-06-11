<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Mission extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'date',
        'description',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
