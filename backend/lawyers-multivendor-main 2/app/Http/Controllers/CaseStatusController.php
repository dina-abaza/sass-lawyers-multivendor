<?php

namespace App\Http\Controllers;

use App\Models\CaseStatus;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CaseStatusController extends Controller implements HasMiddleware
{
    /**
     * تعريف الـ Middleware الخاص بالكنترولر (Laravel 11 Style)
     */
       public static function middleware(): array
    {
        return [
            new Middleware('permission:view_case_statuses', only: ['index', 'show']),
            new Middleware('permission:add_case_statuses', only: ['store']),
            new Middleware('permission:edit_case_statuses', only: ['update']),
            new Middleware('permission:delete_case_statuses', only: ['destroy']),
        ];
    }

    // عرض كل الحالات (عشان تظهر في قائمة Dropdown في صفحة قضية جديدة)
    public function index()
    {
        $statuses = CaseStatus::all();
        return response()->json($statuses);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
'name' => 'sometimes|string|unique:case_statuses,name,' . $id,]);
    $status = CaseStatus::findOrFail($id);

        $status->update($validatedData);
        return response()->json([
            'message' => 'تم تعديل حالة القضية بنجاح',
            'data' => $status
        ], 200);
    }

    // حفظ حالة جديدة من الشاشة
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|unique:case_statuses,name',
        ]);

        $status = CaseStatus::create($validatedData);

        return response()->json([
            'message' => 'تم حفظ حالة القضية بنجاح',
            'data' => $status
        ], 201);
    }

    public function destroy($id)
{
    $status = CaseStatus::findOrFail($id);
    $status->delete();

    return response()->json([
        'message' => 'تم حذف حالة القضية بنجاح'
    ], 200);
}

}
