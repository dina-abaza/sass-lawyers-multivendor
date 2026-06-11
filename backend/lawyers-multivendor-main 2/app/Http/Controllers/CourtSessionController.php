<?php

namespace App\Http\Controllers;

use App\Models\CourtSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CourtSessionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view_sessions', only: ['index', 'show']),
            new Middleware('permission:create_sessions', only: ['store']),
            new Middleware('permission:edit_sessions', only: ['update']),
            new Middleware('permission:delete_sessions', only: ['destroy']),
        ];
    }
    /**
     * عرض كل الجلسات
     */
    public function index()
    {
        $sessions = CourtSession::with(['legalCase', 'lawyer', 'status'])
            ->latest()
            ->get();

        return response()->json($sessions, 200);
    }

    /**
     * عرض جلسة واحدة
     */
    public function show($id)
    {
        $session = CourtSession::with(['legalCase', 'lawyer', 'status'])
            ->findOrFail($id);

        return response()->json($session, 200);
    }

    /**
     * إنشاء جلسة جديدة
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id'         => 'required|exists:cases,id',
            'user_id'         => 'required|exists:users,id',
            'case_status_id'  => 'required|exists:case_statuses,id',

            'session_number'  => 'nullable|string|max:255',
            'court_side'      => 'nullable|string|max:255',
            'day'             => 'nullable|string|max:50',
            'agency'          => 'nullable|string|max:255',

            'date'            => 'nullable|date',
            'date_hijri'      => 'nullable|string|max:50',
            'session_time'    => 'nullable',
            'reminder_date'   => 'nullable|date',

            'notes'           => 'nullable|string',
            'files.*'         => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        // رفع ملفات متعددة
        if ($request->hasFile('files')) {
            $paths = [];
            foreach ($request->file('files') as $file) {
                $paths[] = $file->store('court_session_files', 'public');
            }
            $validated['files'] = $paths;
        }

        $session = CourtSession::create($validated);

        return response()->json([
            'message' => 'تم إنشاء الجلسة بنجاح',
            'data' => $session
        ], 201);
    }

    /**
     * تحديث جلسة
     */
    public function update(Request $request, $id)
    {
        $session = CourtSession::findOrFail($id);

        $validated = $request->validate([
            'case_id'         => 'sometimes|exists:cases,id',
            'user_id'         => 'sometimes|exists:users,id',
            'case_status_id'  => 'sometimes|exists:case_statuses,id',

            'session_number'  => 'nullable|string|max:255',
            'court_side'      => 'nullable|string|max:255',
            'day'             => 'nullable|string|max:50',
            'agency'          => 'nullable|string|max:255',

            'date'            => 'nullable|date',
            'date_hijri'      => 'nullable|string|max:50',
            'session_time'    => 'nullable',
            'reminder_date'   => 'nullable|date',

            'notes'           => 'nullable|string',
            'files.*'         => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        // إضافة ملفات جديدة (من غير حذف القديمة)
        if ($request->hasFile('files')) {
            $paths = $session->files ?? [];

            foreach ($request->file('files') as $file) {
                $paths[] = $file->store('court_session_files', 'public');
            }

            $validated['files'] = $paths;
        }

        $session->update($validated);

        return response()->json([
            'message' => 'تم تعديل الجلسة بنجاح',
            'data' => $session
        ], 200);
    }

    /**
     * حذف جلسة
     */
   public function destroy($id)
{
    $session = CourtSession::findOrFail($id);

    // Convert the string to an array
    $files = is_string($session->files) ? json_decode($session->files, true) : $session->files;

    if (is_array($files)) {
        foreach ($files as $file) {
            if (Storage::disk('public')->exists($file)) {
                Storage::disk('public')->delete($file);
            }
        }
    }

    $session->delete();

    return response()->json([
        'message' => 'تم حذف الجلسة بنجاح'
    ], 200);
}
}
