<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TaskController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view_tasks', only: ['index', 'show']),
            new Middleware('permission:create_tasks', only: ['store']),
            new Middleware('permission:edit_tasks', only: ['update']),
            new Middleware('permission:delete_tasks', only: ['destroy']),
            new Middleware('permission:view_archived_tasks', only: ['archivetasks']),
        ];
    }
    /**
     * عرض كل المهام
     */
    public function index()
    {
        $tasks = Task::with(['employee.department', 'legalCase'])
            ->latest()
            ->get();

        return response()->json($tasks, 200);
    }


    public function archivetasks()
    {
        $archivetasks = Task::with(['employee.department', 'legalCase'])
            ->where('status', 'archived')
            ->latest()
            ->get();

        return response()->json($archivetasks, 200);
    }

    /**
     * عرض مهمة واحدة
     */
    public function show($id)
    {
        $task = Task::with(['employee', 'legalCase'])
            ->findOrFail($id);

        return response()->json($task, 200);
    }

    /**
     * إنشاء مهمة جديدة
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'employee_id' => 'required|exists:employees,id',
            'case_id'    => 'nullable|exists:cases,id',
            'type'       => 'required|in:internal,external',
            'status'     => 'required|in:active,completed,archived',
            'date'       => 'nullable|date',
            'date_hijri' => 'nullable|string',
            'time'       => 'nullable',
            'notes'      => 'nullable|string',
        ]);

        $task = Task::create($validated);

        return response()->json([
            'message' => 'تم إضافة المهمة بنجاح',
            'data' => $task
        ], 201);
    }

    /**
     * تحديث مهمة
     */
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'employee_id' => 'sometimes|exists:employees,id',
            'case_id'    => 'nullable|exists:cases,id',
            'type'       => 'sometimes|in:internal,external',
            'status'     => 'sometimes|in:active,completed,archived',
            'date'       => 'nullable|date',
            'date_hijri' => 'nullable|string',
            'time'       => 'nullable',
            'notes'      => 'nullable|string',
        ]);

        $task->update($validated);

        return response()->json([
            'message' => 'تم تعديل المهمة بنجاح',
            'data' => $task
        ], 200);
    }

    /**
     * حذف مهمة
     */
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json([
            'message' => 'تم حذف المهمة بنجاح'
        ], 200);
    }
}
