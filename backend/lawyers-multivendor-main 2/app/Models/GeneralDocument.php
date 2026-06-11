<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class GeneralDocument extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'file_type',
        'description',
        'notes',
        'files',
        'tenant_id',
    ];

    protected $casts = [
        'files' => 'array',
    ];

    protected function files(): Attribute
    {
        $normalize = function ($value): array {
            if ($value === null || $value === '') {
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

                return [];
            }

            return [];
        };

        $mapItem = function ($item) {
            if (is_string($item)) {
                return $item !== '' ? ['path' => tenant_asset($item)] : null;
            }

            if (! is_array($item)) {
                return $item;
            }

            $path = $item['path'] ?? null;

            return [
                ...$item,
                'path' => $path ? tenant_asset($path) : null,
            ];
        };

        return Attribute::make(
            get: fn ($value) => array_values(array_filter(array_map($mapItem, $normalize($value)))),
        );
    }

    /**
     * مسارات الملفات كما في قاعدة البيانات (للحذف عبر Storage وللدمج عند الرفع).
     */
    public function rawFilesForStorage(): array
    {
        $raw = $this->getRawOriginal('files');

        if ($raw === null || $raw === '') {
            return [];
        }

        if (is_array($raw)) {
            return $raw;
        }

        if (is_string($raw)) {
            $decoded = json_decode($raw, true);

            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }
}
