<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class DeductionSheet extends Model
{
    use BelongsToTenant;
    protected $fillable = [
        'deduction_type_id',
        'attendance_id',
        'reason',
        'salary_after_deduction',
        'tenant_id',
        'amount',
    ];

    public function deductionType()
    {
        return $this->belongsTo(DeductionType::class);
    }

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }
}
