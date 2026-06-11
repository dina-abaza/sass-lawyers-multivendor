<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles
    ,BelongsToTenant;

protected $guard_name = 'api';
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'latitude',
        'longitude',
        'biometric_key',
        'biometric_enabled',
        'profile_image',
        'tenant_id',
        'requested_tenant_name',
        'status',
        'domain',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',

    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'latitude' => 'float',
            'longitude' => 'float',
            'biometric_enabled' => 'boolean',
        ];
    }

    protected function profileImage(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? tenant_asset($value) : null,
        );
    }
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function cases()
{
    return $this->hasMany(LegalCase::class);
}

    public function sessions()
{
    return $this->hasMany(CourtSession::class, 'case_id');
}

public function notifications()
{
    return $this->hasMany(Notification::class);
}

    public function tasks()
{
    return $this->hasMany(Task::class);
}

    public function contracts()
{
    return $this->hasMany(Contract::class);
}

    public function accounts()
{
    return $this->hasMany(Account::class);
}

    public function invoices()
{
    return $this->hasMany(Invoice::class);
}

    public function vacations()
{
    return $this->hasMany(Vacation::class);
}

    public function salarySheets()
{
    return $this->hasMany(SalarySheet::class);
}

    public function generalDocuments()
{
    return $this->hasMany(GeneralDocument::class);
}

    public function legalDocuments()
{
    return $this->hasMany(LegalDocument::class);
}

    public function paymentVouchers()
{
    return $this->hasMany(PaymentVoucher::class);
}

    public function receipts()
{
    return $this->hasMany(Receipt::class);
}

    public function consultations()
{
    return $this->hasMany(Consultation::class);
}

public function employee()
{
    return $this->hasOne(Employee::class);
}
public function workLocations()
{
    return $this->belongsToMany(WorkLocation::class, 'user_work_location');
}
}
