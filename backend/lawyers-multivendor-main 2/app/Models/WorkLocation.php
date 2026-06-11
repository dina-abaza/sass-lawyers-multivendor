<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class WorkLocation extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'latitude', 'longitude', 'radius', 'tenant_id'];

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
