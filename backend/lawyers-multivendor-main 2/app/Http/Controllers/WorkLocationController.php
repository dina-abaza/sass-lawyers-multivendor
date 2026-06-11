<?php

namespace App\Http\Controllers;

use App\Models\WorkLocation;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class WorkLocationController extends Controller implements HasMiddleware
{
    // تأمين الفروع بصلاحيات الـ HR أو الـ Owner
    public static function middleware(): array
    {
         return [
        new Middleware('role_or_permission:owner|access_hr_list', except: ['index']),
    ];
    }

    public function index()
    {
        $locations = WorkLocation::all();
        return response()->json([
            'status' => true,
            'data' => $locations
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius'    => 'nullable|integer|min:10',
        ]);

        $location = WorkLocation::create($validated);

        return response()->json([
            'status'  => true,
            'message' => 'تم إضافة موقع العمل بنجاح',
            'data'    => $location
        ], 201);
    }

    public function show($id)
    {
        $location = WorkLocation::findOrFail($id);
        return response()->json([
            'status' => true,
            'data' => $location
        ]);
    }

    public function update(Request $request, $id)
    {
        $location = WorkLocation::findOrFail($id);

        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'latitude'  => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'radius'    => 'sometimes|integer|min:10',
        ]);

        $location->update($validated);

        return response()->json([
            'status'  => true,
            'message' => 'تم تحديث الموقع بنجاح',
            'data'    => $location
        ]);
    }

    public function destroy($id)
    {
        $location = WorkLocation::findOrFail($id);
        $location->delete();

        return response()->json([
            'status'  => true,
            'message' => 'تم حذف الموقع بنجاح'
        ]);
    }
}
