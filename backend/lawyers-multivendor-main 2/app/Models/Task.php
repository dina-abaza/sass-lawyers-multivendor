<?php

namespace App\Models;

use App\Traits\CheckSubscriptionLimits;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Task extends Model
{
    use HasFactory, BelongsToTenant,CheckSubscriptionLimits;

    protected $fillable = [
        'name',
        'employee_id',
        'case_id',
        'type',
        'status',
        'date',
        'date_hijri',
        'time',
        'notes',
        'tenant_id',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    // 🔗 العلاقات
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function legalCase()
    {
        return $this->belongsTo(LegalCase::class, 'case_id');
    }
}
