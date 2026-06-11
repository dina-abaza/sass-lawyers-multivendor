<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'name', // التعديل هنا أيضاً
        'price_monthly',
        'price_yearly',
        'trial_days',
        'max_users',
        'max_clients',
        'max_cases',
        'max_sessions',
        'max_tasks',
        'has_templates',
        'has_financial_management',
        'has_attendance',
        'has_lawyer_reports',
        'has_notifications'
    ];

    protected $casts = [
        'has_templates' => 'boolean',
        'has_financial_management' => 'boolean',
        'has_attendance' => 'boolean',
        'has_lawyer_reports' => 'boolean',
        'has_notifications' => 'boolean',
        'price_monthly' => 'float',
        'price_yearly' => 'float',
    ];

    /**
     * العلاقة مع اشتراكات المستأجرين
     */
    public function tenantSubscriptions()
    {
        return $this->hasMany(TenantSubscription::class, 'subscription_id');
    }
}
