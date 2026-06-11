<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Account extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'status', 'parent_id', 'tenant_id'];
    public function parent()
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    public function journalItems()
    {
        return $this->hasMany(JournalItem::class);
    }
}
