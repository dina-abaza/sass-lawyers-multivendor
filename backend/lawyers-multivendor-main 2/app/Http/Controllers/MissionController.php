<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Mission;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MissionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
    new Middleware('role_or_permission:owner|access_hr_list'),     
   ];
    }

    /**
     * عرض قائمة المأموريات (مع فلترة اختيارية بالموظف أو التاريخ)
     */
    public function index(Request $request)
    {
        $query = Mission::with(['employee', 'attendances']);

        // فلترة بالموظف
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // فلترة بالتاريخ
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // فلترة بشهر ومنة (مثلاً: month=4&year=2026)
        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('date', $request->month)
                  ->whereYear('date', $request->year);
        }

        return response()->json([
            'status' => true,
            'data'   => $query->latest()->paginate(15),
        ]);
    }

    // /**
    //  * إنشاء مأمورية يدوياً (من الأدمن)
    //  */
    // public function store(Request $request)
    // {
    //     $data = $request->validate([
    //         'employee_id' => ['required', 'exists:employees,id'],
    //         'date'        => ['required', 'date'],
    //         'description' => ['required', 'string', 'max:1000'],
    //     ]);

    //     $mission = Mission::create($data);

    //     return response()->json([
    //         'status'  => true,
    //         'message' => 'تم تسجيل المأمورية بنجاح',
    //         'data'    => $mission->load('employee'),
    //     ], 201);
    // }

    // /**
    //  * عرض مأمورية واحدة بالتفاصيل
    //  */
    // public function show(Mission $mission)
    // {
    //     return response()->json([
    //         'status' => true,
    //         'data'   => $mission->load(['employee', 'attendances']),
    //     ]);
    // }

    // /**
    //  * تعديل مأمورية
    //  */
    // public function update(Request $request, Mission $mission)
    // {
    //     $data = $request->validate([
    //         'employee_id' => ['sometimes', 'exists:employees,id'],
    //         'date'        => ['sometimes', 'date'],
    //         'description' => ['sometimes', 'string', 'max:1000'],
    //     ]);

    //     $mission->update($data);

    //     return response()->json([
    //         'status'  => true,
    //         'message' => 'تم تعديل المأمورية بنجاح',
    //         'data'    => $mission->load('employee'),
    //     ]);
    // }

    // /**
    //  * حذف مأمورية
    //  */
    // public function destroy(Mission $mission)
    // {
    //     // فك الربط مع الحضور قبل الحذف
    //     $mission->attendances()->update(['mission_id' => null]);

    //     $mission->delete();

    //     return response()->json([
    //         'status'  => true,
    //         'message' => 'تم حذف المأمورية بنجاح',
    //     ]);
    // }

    // /**
    //  * مأموريات موظف معين
    //  */
    // public function employeeMissions(Employee $employee)
    // {
    //     $missions = Mission::with('attendances')
    //         ->where('employee_id', $employee->id)
    //         ->latest()
    //         ->paginate(15);

    //     return response()->json([
    //         'status' => true,
    //         'data'   => $missions,
    //     ]);
    // }
}
