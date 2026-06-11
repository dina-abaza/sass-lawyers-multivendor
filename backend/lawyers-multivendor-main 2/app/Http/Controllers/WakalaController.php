<?php

namespace App\Http\Controllers;

use App\Models\Wakala;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class WakalaController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view_wakalas', only: ['index', 'show']),
            new Middleware('permission:create_wakalas', only: ['store']),
            new Middleware('permission:edit_wakalas', only: ['update']),
            new Middleware('permission:delete_wakalas', only: ['destroy']),
        ];
    }
    /**
     * عرض كل الوكالات
     */
    public function index()
    {
        return response()->json(
            Wakala::latest()->get(),
            200
        );
    }

    /**
     * عرض وكالة واحدة
     */
    public function show($id)
    {
        $wakala = Wakala::findOrFail($id);
        return response()->json($wakala, 200);
    }

    /**
     * إنشاء وكالة جديدة
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'wakala_number' => 'required|string|unique:wakalas,wakala_number',
            'wakala_date_hijri' => 'nullable|string|max:50',
            'wakala_expiry_hijri' => 'nullable|string|max:50',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            $validated['file'] = $request->file('file')
                ->store('wakala_files', 'public');
        }

        $wakala = Wakala::create($validated);

        return response()->json([
            'message' => 'تم إنشاء الوكالة بنجاح',
            'data' => $wakala
        ], 201);
    }

    /**
     * تحديث وكالة
     */
    public function update(Request $request, $id)
    {
        $wakala = Wakala::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'wakala_number' => 'sometimes|string|unique:wakalas,wakala_number,' . $id,
            'wakala_date_hijri' => 'nullable|string|max:50',
            'wakala_expiry_hijri' => 'nullable|string|max:50',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            if ($wakala->file) {
                $oldPath = str_replace(asset('storage/'), '', $wakala->file);
                Storage::disk('public')->delete($oldPath);
            }

            $validated['file'] = $request->file('file')
                ->store('wakala_files', 'public');
        }

        $wakala->update($validated);

        return response()->json([
            'message' => 'تم تعديل الوكالة بنجاح',
            'data' => $wakala
        ], 200);
    }

    /**
     * حذف وكالة
     */
    public function destroy($id)
    {
        $wakala = Wakala::findOrFail($id);

        if ($wakala->file) {
            $path = str_replace(asset('storage/'), '', $wakala->file);
            Storage::disk('public')->delete($path);
        }

        $wakala->delete();

        return response()->json([
            'message' => 'تم حذف الوكالة بنجاح'
        ], 200);
    }
}
