<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class CaseStatus extends Model {
    use BelongsToTenant;

    protected $fillable = ['name', 'tenant_id' ];
    // علاقة الحالة بالقضايا
   public function cases()
{
    return $this->hasMany(LegalCase::class);
}

    public function sessions()
{
    return $this->hasMany(CourtSession::class, 'case_id');
}
}
