<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Attendance extends Model
{
    use BelongsToTenant;


    protected $fillable = [
        'user_id',
        'employee_id',
        'work_location_id',
        'check_in',
        'check_out',
        'lat_in',
        'long_in',
        'is_outside_range',
        'notes',
        'tenant_id',
        'mission_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function workLocation()
    {
        return $this->belongsTo(WorkLocation::class);
    }
    public function deductionSheet()
    {
        return $this->hasOne(DeductionSheet::class);
    }

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }
}
