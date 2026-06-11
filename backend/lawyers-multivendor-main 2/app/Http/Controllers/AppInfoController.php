<?php

namespace App\Http\Controllers;

use App\Models\AppInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AppInfoController extends Controller
{
    // عرض الإعدادات
    public function index()
    {
        $appInfo = AppInfo::first();

        return response()->json($appInfo);
    }

    // تحديث الإعدادات
    public function update(Request $request)
    {
        $data = $request->validate([
            'app_name' => ['required', 'string'],
            'working_hours' => ['required', 'integer', 'min:1'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg', 'max:2048'],
        ]);

        $appInfo = AppInfo::firstOrCreate([]);

        // رفع اللوجو
        if ($request->hasFile('logo')) {
            if ($appInfo->logo) {
                Storage::disk('public')->delete($appInfo->logo);
            }

            $data['logo'] = $request->file('logo')->store('app', 'public');
        }

        $appInfo->update($data);
        if ($appInfo->logo) {
            $appInfo->logo = tenant_asset($appInfo->getRawOriginal('logo'));
        }

        return response()->json([
            'message' => 'تم تحديث الإعدادات بنجاح',
            'data' => $appInfo,
        ]);
    }
}
