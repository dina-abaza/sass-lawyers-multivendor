<?php

namespace App\Http\Controllers;

use App\Models\Vacation;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class VacationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:access_hr_list'),
        ];
    }
    public function index()
    {
        return Vacation::with('employee')
            ->latest()
            ->paginate(10);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string'],
        ]);

        $vacation = Vacation::create($data);

        return response()->json([
            'message' => 'تم إضافة العطلة بنجاح',
            'data' => $vacation,
        ], 201);
    }

    public function show(Vacation $vacation)
    {
        return $vacation->load('employee');
    }

    public function update(Request $request, Vacation $vacation)
    {
        $data = $request->validate([
            'employee_id' => ['sometimes', 'exists:employees,id'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string'],
        ]);

        $vacation->update($data);

        return response()->json([
            'message' => 'تم تعديل العطلة',
            'data' => $vacation,
        ]);
    }

    public function destroy(Vacation $vacation)
    {
        $vacation->delete();

        return response()->json([
            'message' => 'تم حذف العطلة',
        ]);
    }
}
