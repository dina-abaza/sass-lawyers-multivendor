<?php

namespace App\Http\Controllers;

use App\Mail\StaffGeneralMessage;
use App\Models\Employee;
use App\Models\SalarySheet;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmployeeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:access_hr_list', only: ['store', 'update', 'destroy']),
            new Middleware('permission:view_employees', only: ['index', 'show']),
        ];
    }
    /**
     * عرض كل الموظفين
     */
    public function index()
    {
        $employees = Employee::with('department')
            ->latest()
            ->get();

        return response()->json($employees, 200);
    }

    /**
     * عرض موظف واحد
     */
    public function show($id)
    {
        $employee = Employee::with('department')
            ->findOrFail($id);

        return response()->json($employee, 200);
    }

    /**
     * إنشاء موظف جديد
     */
    public function store(Request $request)
    {
        // 1. التحقق من البيانات (إضافة حقول الراتب كحقول إجبارية)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email|unique:users,email',
            'department_id' => 'required|exists:departments,id',
            'amount' => 'required|numeric|min:0', // الراتب إجباري
            'payment_method' => 'required|in:cash,bank,wallet', // طريقة الدفع إجبارية
            'notes' => 'nullable|string',
        ]);

        // نستخدم Transaction لضمان سلامة البيانات
        return \DB::transaction(function () use ($validated) {

            $tenantId = auth()->user()->tenant_id;

            // 2. إنشاء الموظف (Employee)
            $employee = Employee::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'department_id' => $validated['department_id'],
                'tenant_id' => $tenantId,
            ]);

            // 3. إنشاء المستخدم (User)
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => \Hash::make('12345678'), // باسورد افتراضي
                'status' => 'approved',
                'tenant_id' => $tenantId,
            ]);

            // إسناد الصلاحية
            $user->assignRole('user');

            // 4. ربط الموظف باليوزر
            $employee->update([
                'user_id' => $user->id
            ]);

            // 5. إنشاء سجل الراتب (SalarySheet) بالقيم المدخلة
            $salary = SalarySheet::create([
                'employee_id' => $employee->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
                'tenant_id' => $tenantId,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'تم إنشاء الموظف، حساب المستخدم، وتحديد الراتب بنجاح',
                'data' => [
                    'employee' => $employee->load('department'),
                    'salary' => $salary,
                    'note' => 'الباسورد الافتراضي هو: 12345678'
                ]
            ], 201);
        });
    }
    /**
     * تحديث موظف
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:employees,email,' . $id,
            'department_id' => 'sometimes|exists:departments,id',
        ]);

        $employee->update($validated);

        return response()->json([
            'message' => 'تم تعديل بيانات الموظف بنجاح',
            'data' => $employee
        ], 200);
    }

    /**
     * حذف موظف
     */
    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();

        return response()->json([
            'message' => 'تم حذف الموظف بنجاح'
        ], 200);
    }

    public function sendMessageToStaff(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $employees = Employee::all(); 

        $subject = $request->subject;
        $messageContent = $request->message;
        $senderName = auth()->user()->name;

        foreach ($employees as $employee) {
            Mail::to($employee->email)->queue(new StaffGeneralMessage($subject, $messageContent, $senderName));
        }

        return response()->json(['message' => 'تم إرسال الرسالة لجميع الموظفين بنجاح']);
    }

    public function sendMessageToSpecificEmployee(Request $request)
    {
        $request->validate([
            'employee_ids'  => 'required|array|min:1',
            'employee_ids.*'=> 'required|integer|exists:employees,id',
            'subject'       => 'required|string|max:255',
            'message'       => 'required|string',
        ]);

        $employees = Employee::whereIn('id', $request->employee_ids)->get();

        if ($employees->isEmpty()) {
            return response()->json(['error' => 'لم يتم العثور على أي موظف من الـ IDs المرسلة'], 404);
        }

        $subject        = $request->subject;
        $messageContent = $request->message;
        $senderName     = auth()->user()->name;

        foreach ($employees as $employee) {
            Mail::to($employee->email)->queue(new StaffGeneralMessage($subject, $messageContent, $senderName));
        }

        return response()->json([
            'message' => "تم إرسال الرسالة بنجاح إلى {$employees->count()} موظف/موظفين",
            'recipients' => $employees->pluck('name'),
        ]);
    }
}
