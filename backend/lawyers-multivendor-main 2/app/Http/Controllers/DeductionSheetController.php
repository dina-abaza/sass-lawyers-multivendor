<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\DeductionSheet;
use App\Models\DeductionType;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DeductionSheetController extends Controller implements HasMiddleware
{
    // تعريف الميدل وير
    public static function middleware(): array
    {
        return [
            new Middleware('role_or_permission:owner|access_hr_list')

        ];
    }
    public function index()
    {

        // عرض جميع خصومات الحضور
        $deductions = DeductionSheet::with(['deductionType', 'attendance'])->get();

        return response()->json([
            'status' => true,
            'data' => $deductions,
        ]);
    }
    public function show($id)
    {
        // عرض تفاصيل خصم معين
        $deduction = DeductionSheet::with(['deductionType', 'attendance'])->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $deduction,
        ]);
    }

    //hr يطبق خصم على موظف بناءً على حضوره
    public function store(Request $request)
    {
        $validated = $request->validate([
            'attendance_id'     => 'required|exists:attendances,id',
            'deduction_type_id' => 'required|exists:deduction_types,id',
            'reason'            => 'nullable|string|max:255',
        ]);

        $deductionType = DeductionType::findOrFail($validated['deduction_type_id']);
        $deduction_amount = $deductionType->value;

        $attendance = Attendance::with('employee.salarySheet')->findOrFail($validated['attendance_id']);
        $current_salary = $attendance->employee->salarySheet?->amount;

        if (!$current_salary) {
            return response()->json([
                'status' => false,
                'message' => 'لا يمكن تطبيق الخصم: الموظف ليس له سجل راتب محدد'
            ], 422);
        }

        $salary_after_deduction = $current_salary - $deduction_amount;

        $deductionSheet = DeductionSheet::create([
            'tenant_id'              => $attendance->tenant_id,
            'attendance_id'          => $validated['attendance_id'],
            'deduction_type_id'      => $deductionType->id,
            'amount'                 => $deduction_amount,
            'salary_after_deduction' => $salary_after_deduction,
            'reason'                 => $validated['reason'] ?? "خصم : " . " " . $deductionType->name,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'تم تطبيق الخصم بنجاح  ',
            'data' => $deductionSheet->load('deductionType'),
            'salary' => $current_salary,

        ], 201);
    }

    public function destroy($id)
    {
        $deduction = DeductionSheet::findOrFail($id);

        // 2. حذف السجل
        $deduction->delete();

        return response()->json([
            'status' => true,
            'message' => 'تم حذف سجل الخصم بنجاح وإلغاء أثره المالي'
        ], 200);
    }
}
