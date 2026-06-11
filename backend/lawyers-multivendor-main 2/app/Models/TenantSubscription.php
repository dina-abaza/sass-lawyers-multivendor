<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class TenantSubscription extends Model
{
    use BelongsToTenant; // لإضافة tenant_id تلقائياً وفلترة البيانات

    protected $fillable = [
        'tenant_id',
        'subscription_id',
        'starts_at',
        'expires_at',
        'status',
        'payment_transaction_id',
        'amount_paid',
        'type',
        'notes',
    ];

    protected $casts = [
        'starts_at'  => 'date',
        'expires_at' => 'date',
        'amount_paid' => 'decimal:2',
    ];

    /**
     * العلاقة مع باقة الاشتراك الأساسية
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }
}
