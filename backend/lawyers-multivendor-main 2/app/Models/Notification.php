<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Notification extends Model
{
    use BelongsToTenant;

    protected $fillable = ['user_id', 'title', 'message', 'is_read', 'tenant_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
