<?php

namespace App\Http\Controllers;

use App\Models\SalarySheet;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SalarySheetController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('role_or_permission:owner|access_hr_list')
        ];
    }
    public function index()
    {
        return SalarySheet::with('employee')
            ->latest()
            ->paginate(10);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,bank,wallet'],
            'notes' => ['nullable', 'string'],
        ]);

   $sheet = SalarySheet::updateOrCreate(
        ['employee_id' => $data['employee_id']],
        $data
    );
        return response()->json([
            'message' => 'تم إضافة الراتب بنجاح',
            'data' => $sheet,
        ], 201);
    }

    public function show(SalarySheet $salarySheet)
    {
        return $salarySheet->load('employee');
    }

    public function update(Request $request, SalarySheet $salarySheet)
    {
        $data = $request->validate([
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'payment_method' => ['sometimes', 'in:cash,bank,wallet'],
            'notes' => ['nullable', 'string'],
        ]);

        $salarySheet->update($data);

        return response()->json([
            'message' => 'تم تعديل الراتب',
            'data' => $salarySheet,
        ]);
    }

    public function destroy(SalarySheet $salarySheet)
    {
        $salarySheet->delete();

        return response()->json([
            'message' => 'تم حذف الراتب',
        ]);
    }
}
