<?php

namespace App\Models;

use App\Traits\CheckSubscriptionLimits;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class LegalCase extends Model
{
    use HasFactory , BelongsToTenant,CheckSubscriptionLimits;

    // بما إن اسم الموديل مش مطابق لاسم الجدول
    protected $table = 'cases';

    protected $fillable = [
        'tenant_id',
        'case_number',
        'agency',
        'office',
        'type',
        'contract_name',
        'contract_id',
        'user_id',
        'customer_id',
        'value',
        'subject',
        'case_status_id',
        'opponent_name',
        'date',
        'date_hijri',
        'notes',
        'files',
    ];

    protected $casts = [
        'files' => 'array',
        'date'  => 'date',
    ];

    /**
     * 🔗 العلاقات
     */

    // القضية تنتمي إلى حالة قضية
    public function status()
    {
        return $this->belongsTo(CaseStatus::class, 'case_status_id');
    }

    // القضية تنتمي إلى عميل
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // القضية تنتمي إلى محامي (User)
    public function lawyer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sessions()
{
    return $this->hasMany(CourtSession::class, 'case_id');
}

public function tasks()
{
    return $this->hasMany(Task::class, 'case_id');
}

public function contract()
{
    return $this->belongsTo(Contract::class);
}

// القضية لها فاتورة واحدة (أو أكثر حسب نظامك، بس غالباً واحدة)
public function invoice()
{
    return $this->hasOne(Invoice::class, 'case_id');
}

}
