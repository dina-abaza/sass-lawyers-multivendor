<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class DeductionType extends Model
{
    use BelongsToTenant;
    protected $fillable = ['tenant_id', 'name', 'value'];

    public function deductionSheets()
    {
        return $this->hasMany(DeductionSheet::class);
    }

}
