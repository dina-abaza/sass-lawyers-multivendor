<?php

namespace App\Models;

use App\Traits\CheckSubscriptionLimits;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Employee extends Model
{
    use HasFactory, BelongsToTenant,CheckSubscriptionLimits;

    protected $fillable = [
        'name',
        'user_id',
        'email',
        'department_id',
        'tenant_id',
    ];

    public function user()
{
    return $this->belongsTo(User::class);
}
    // الموظف ينتمي لقسم
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    public function tasks()
{
    return $this->hasMany(Task::class);
}

public function salarySheet()
{
    return $this->hasOne(SalarySheet::class);
}
public function attendances()
{
    return $this->hasOne(Attendance::class);
}

public function vacations()
{
    return $this->hasMany(Vacation::class);
}

}
