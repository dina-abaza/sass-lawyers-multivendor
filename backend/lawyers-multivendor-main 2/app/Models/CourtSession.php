<?php

namespace App\Models;

use App\Traits\CheckSubscriptionLimits;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class CourtSession extends Model
{
    use HasFactory, BelongsToTenant,CheckSubscriptionLimits;

    protected $table = 'court_sessions';

    protected $fillable = [
        'case_id',
        'user_id',
        'tenant_id',
        'case_status_id',
        'session_number',
        'court_side',
        'day',
        'agency',
        'date',
        'date_hijri',
        'session_time',
        'reminder_date',
        'notes',
        'files',
    ];

    protected $casts = [
        'date'          => 'date',
        'reminder_date' => 'date',
        'files'         => 'array',
    ];

    protected function files(): Attribute
    {
        $normalize = function ($value): array {
            if (is_null($value) || $value === '') {
                return [];
            }

            if (is_array($value)) {
                return $value;
            }

            if (is_string($value)) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return is_array($decoded) ? $decoded : [$decoded];
                }

                return [$value];
            }

            return (array) $value;
        };

        return Attribute::make(
            get: fn ($value) => array_values(array_filter(array_map(
                fn ($path) => $path ? tenant_asset($path) : null,
                $normalize($value)
            ))),
        );
    }

    /**
     * 🔗 العلاقات
     */

    // الجلسة تنتمي إلى قضية
    public function legalCase()
    {
        return $this->belongsTo(LegalCase::class, 'case_id');
    }

    // الجلسة تنتمي إلى محامي (User)
    public function lawyer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // الجلسة تنتمي إلى حالة (حالة الجلسة)
    public function status()
    {
        return $this->belongsTo(CaseStatus::class, 'case_status_id');
    }
}
