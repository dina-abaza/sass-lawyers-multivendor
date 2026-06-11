<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * عرض كل الأقسام
     */
    public function index()
    {
        return response()->json(
            Department::latest()->get(),
            200
        );
    }

    /**
     * عرض قسم واحد
     */
    public function show($id)
    {
        $department = Department::findOrFail($id);
        return response()->json($department, 200);
    }

    /**
     * إنشاء قسم جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
        ]);

        $department = Department::create($validated);

        return response()->json([
            'message' => 'تم إنشاء القسم بنجاح',
            'data' => $department
        ], 201);
    }

    /**
     * تحديث قسم
     */
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'sometimes|string|max:255',
            'name_en' => 'sometimes|string|max:255',
        ]);

        $department->update($validated);

        return response()->json([
            'message' => 'تم تعديل القسم بنجاح',
            'data' => $department
        ], 200);
    }

    /**
     * حذف قسم
     */
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return response()->json([
            'message' => 'تم حذف القسم بنجاح'
        ], 200);
    }
}
