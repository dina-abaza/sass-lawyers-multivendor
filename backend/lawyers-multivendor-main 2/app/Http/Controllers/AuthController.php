<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\DeductionSheet;
use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\Mission;
use App\Models\TenantSubscription;
use App\Models\User;
use App\Models\WorkLocation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\PermissionRegistrar;

class AuthController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('permission:view_users', only: ['index', 'show']),
            new Middleware('permission:create_users', only: ['adminStoreUser']),
            new Middleware('permission:edit_users', only: ['update']),
            new Middleware('permission:delete_users', only: ['destroy']),
        ];
    }
    private function ensureRolesExist(): void
    {
        if (SpatieRole::where('guard_name', 'api')->exists()) {
            return;
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_user_roles', 'create_user_role', 'edit_user_role', 'delete_user_role',
            'edit_settings', 'invoices_settings', 'access_finance_dept',
            'view_invoices', 'create_invoices', 'edit_invoices', 'delete_invoices',
            'view_vouchers', 'create_vouchers', 'edit_vouchers', 'delete_vouchers',
            'access_hr_list', 'view_employees',
            'view_cases', 'create_cases', 'edit_cases', 'delete_cases',
            'view_cases_archive', 'view_lawyer_reports',
            'view_sessions', 'create_sessions', 'edit_sessions', 'delete_sessions',
            'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
            'view_consultations', 'create_consultations', 'edit_consultations', 'delete_consultations',
            'view_wakalas', 'create_wakalas', 'edit_wakalas', 'delete_wakalas',
            'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks', 'view_archived_tasks',
            'view_documents', 'edit_documents', 'create_documents', 'delete_documents',
            'send_notifications',
            'add_case_statuses', 'view_case_statuses', 'edit_case_statuses', 'delete_case_statuses',
            'view_global_docs', 'create_global_docs', 'edit_global_docs', 'delete_global_docs',
            'access_accounting_list',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'api');
        }

        $roles = [
            'super_admin', 'owner', 'general_manager', 'administration', 'lawyer',
            'trainee_lawyer', 'secretary', 'legal_consultant', 'accountant', 'hr', 'user',
        ];

        foreach ($roles as $role) {
            SpatieRole::findOrCreate($role, 'api');
        }

        SpatieRole::where('name', 'owner')->where('guard_name', 'api')->first()
            ?->syncPermissions(Permission::where('guard_name', 'api')->get());
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'tenant_name' => 'required|string|max:50|unique:tenants,id',
        ]);

        $this->ensureRolesExist();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => 'pending',
            'tenant_id' => null,
            'requested_tenant_name' => $validated['tenant_name'],
        ]);
        if (User::count() === 1) {
            $user->assignRole('super_admin');
            $user->update([
                'status' => 'approved',
                'requested_tenant_name' => null
            ]);
        } else {
            $user->assignRole('user');
        }


        return response()->json([
            'status' => true,
            'message' => 'تم استلام طلبك، في انتظار موافقة السوبر أدمن لتفعيل مكتبك.',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'biometric_key' => 'nullable|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // 2. التأكد من الموافقة (Approval Status)
        if ($user->status !== 'approved') {
            return response()->json([
                'status' => false,
                'message' => 'حسابك في انتظار الموافقة أو تم رفضه من قبل الإدارة'
            ], 403);
        }

        $user->update([
            'latitude' => $request->latitude ?? $user->latitude,
            'longitude' => $request->longitude ?? $user->longitude,
            'biometric_key' => $request->biometric_key ?? $user->biometric_key,
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->all_permissions = $user->getPermissionsViaRoles()->pluck('name');
        $user->all_roles = $user->getRoleNames();

        // جلب تفاصيل الاشتراك الفعال للمكتب (إن وجد)
        $subscription = null;
        if ($user->tenant_id) {
            $subscription = TenantSubscription::withoutTenancy()
                ->where('tenant_id', $user->tenant_id)
                ->where('status', 'active')
                ->where('expires_at', '>=', now())
                ->with('plan')
                ->latest()
                ->first();
        }

        return response()->json([
            'status' => true,
            'access_token' => $token,
            'user' => $user->makeHidden(['roles']), // إخفاء المجلدات الكبيرة لتقليل الحجم
            'subscription' => $subscription
        ]);
    }


    public function adminStoreUser(Request $request)
    {

        //  الـ Validation
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed', // يفضل إضافة تأكيد كلمة المرور
            'roles'    => 'required|array', // تأكدي إن الاسم في الـ Request هو roles
            'roles.*'  => 'exists:roles,name', // التأكد إن كل Role موجود فعلياً في جدول Spatie
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'tenant_id' => auth()->user()->tenant_id,

        ]);

        $user->assignRole($validated['roles']);

        return response()->json([
            'status' => true,
            'message' => 'User created and roles assigned successfully',
            'user' => $user->load('roles.permissions')
        ], 201);
    }


    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            // 'biometric_key' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('profile_image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }
            $path = $request->file('profile_image')->store('profiles', 'public');
            $validated['profile_image'] = $path;
        }

        $user->update($validated);

        return response()->json([
            'status' => true,
            'user' => $user,
        ]);
    }
      public function AdminUpdateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            // 'biometric_key' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('profile_image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }
            $path = $request->file('profile_image')->store('profiles', 'public');
            $validated['profile_image'] = $path;
        }

        $user->update($validated);

        return response()->json([
            'status' => true,
            'user' => $user,
        ]);
    }



    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['status' => true]);
    }



    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'كلمة المرور الحالية غير صحيحة'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        $user->tokens()->delete();
        $newToken = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'تم تغيير كلمة المرور بنجاح',
            'access_token' => $newToken
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $otp = rand(1000, 9999);

        // حفظ كود التحقق في الكاش لمدة 15 دقيقة
        \Illuminate\Support\Facades\Cache::put('password_reset_otp_' . $request->email, $otp, now()->addMinutes(15));
        
        // إرسال الكود بالايميل
        \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\SendOtpMail($otp));

        return response()->json([
            'status' => true,
            'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح.'
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric|digits:4',
        ]);

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('password_reset_otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'status' => false,
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.'
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'رمز التحقق صحيح.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric|digits:4',
            'password' => 'required|min:8|confirmed',
        ]);

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('password_reset_otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'status' => false,
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.'
            ], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // حذف الكود من الكاش بعد استخدامه
        \Illuminate\Support\Facades\Cache::forget('password_reset_otp_' . $request->email);

        return response()->json([
            'status' => true,
            'message' => 'تم تغيير كلمة المرور بنجاح ويرجى تسجيل الدخول.'
        ]);
    }

    // --- عمليات الحضور والانصراف (بالبصمة والموقع) ---

    public function checkIn(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'latitude'         => 'required|numeric',
            'longitude'        => 'required|numeric',
            'work_location_id' => 'required|exists:work_locations,id',
            'is_on_mission'    => 'sometimes|boolean',
            'mission_description' => 'required_if:is_on_mission,true|nullable|string|max:1000',
        ]);

        $loc = WorkLocation::find($request->work_location_id);
        $dist = $this->getDist($request->latitude, $request->longitude, $loc->latitude, $loc->longitude);
        $isOut = $dist > $loc->radius;

        $employee = Employee::where('user_id', $user->id)->first();
        if (!$employee) {
            return response()->json([
                'status'  => false,
                'message' => 'عفواً، حسابك كـ User غير مرتبط بملف موظف في هذا المكتب'
            ], 404);
        }

        // منع تكرار تسجيل الحضور في نفس اليوم
        $alreadyCheckedIn = Attendance::where('employee_id', $employee->id)
            ->whereDate('check_in', Carbon::today())
            ->exists();

        if ($alreadyCheckedIn) {
            return response()->json([
                'status'  => false,
                'message' => 'لقد قمت بتسجيل الحضور بالفعل لهذا اليوم'
            ], 422);
        }

        // إنشاء سجل المأمورية إن وُجدت
        $mission = null;
        if ($request->boolean('is_on_mission') && $request->filled('mission_description')) {
            $mission = Mission::create([
                'tenant_id'   => $user->tenant_id,
                'employee_id' => $employee->id,
                'date'        => Carbon::today(),
                'description' => $request->mission_description,
            ]);
        }

        $notes = $isOut
            ? "الحضور خارج نطاق " . $loc->name . " بـ " . round($dist) . " متر"
            : "الحضور داخل نطاق " . $loc->name;

        if ($mission) {
            $notes .= " | خارج مأمورية: " . $request->mission_description;
        }

        $att = Attendance::create([
            'user_id'          => $user->id,
            'employee_id'      => $employee->id,
            'work_location_id' => $loc->id,
            'check_in'         => Carbon::now(),
            'lat_in'           => $request->latitude,
            'long_in'          => $request->longitude,
            'is_outside_range' => $isOut,
            'notes'            => $notes,
            'mission_id'       => $mission?->id,
        ]);

        $deductionMessage = null;
        if ($isOut) {
            $deductionMessage = $this->applyDeduction($att);
        }

        return response()->json([
            'status'  => true,
            'message' => $deductionMessage ?? ($mission ? 'تم تسجيل الحضور بنجاح - مأمورية مسجلة ✅' : 'تم تسجيل الحضور بنجاح'),
            'data'    => $att->load(['deductionSheet', 'employee.salarySheet', 'mission'])
        ]);
    }

    public function applyDeduction(Attendance $attendance)
    {
        // لو الموظف في مأمورية → لا خصم
        if ($attendance->mission_id) {
            $attendance->update([
                'notes' => $attendance->notes . " (بدون خصم - مأمورية رسمية)"
            ]);
            return "خارج نطاق بسبب مأمورية رسمية - لا يوجد خصم ✅";
        }

        // 1. تعريف نوع الخصم
        $deductionType = DeductionType::firstOrCreate(
            ['name' => 'خصم خارج النطاق'],
            ['value' => 50]
        );

        // 2. التأكد من وجود سجل راتب
        $salarySheet = $attendance->employee?->salarySheet;
        if (!$salarySheet) {
            $attendance->update([
                'notes' => $attendance->notes . " (تنبيه: لم يتم تطبيق الخصم لعدم وجود سجل راتب)"
            ]);
            return "لا يوجد سجل راتب للموظف";
        }

        // التحقق من وجود خصم سابق اليوم
        $alreadyDeductedToday = DeductionSheet::whereHas('attendance', function ($query) use ($attendance) {
            $query->where('employee_id', $attendance->employee_id)
                ->whereDate('check_in', \Carbon\Carbon::today());
        })
            ->where('deduction_type_id', $deductionType->id)
            ->exists();

        if ($alreadyDeductedToday) {
            $attendance->update([
                'notes' => $attendance->notes . " (تم تطبيق الخصم مسبقاً اليوم)"
            ]);
            return "تم الخصم لهذا الموظف مسبقاً اليوم";
        }

        // 3. حساب القيم المالية
        $salary = $salarySheet->amount;
        $deduction_value = $deductionType->value;
        $salary_after_deduction = $salary - $deduction_value;

        // 4. إنشاء سجل الخصم
        $attendance->deductionSheet()->create([
            'tenant_id'              => $attendance->tenant_id,
            'deduction_type_id'      => $deductionType->id,
            'amount'                 => $deduction_value,
            'salary_after_deduction' => $salary_after_deduction,
            'reason'                 => $attendance->notes,
        ]);

        return "تم تطبيق خصم بقيمة " . $deduction_value;
    }


    public function checkOut(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'latitude'            => 'required|numeric',
            'longitude'           => 'required|numeric',
            'work_location_id'    => 'required|exists:work_locations,id',
            'is_on_mission'       => 'sometimes|boolean',
            'mission_description' => 'required_if:is_on_mission,true|nullable|string|max:1000',
        ]);

        $employee = Employee::where('user_id', $user->id)->first();
        if (!$employee) {
            return response()->json([
                'status'  => false,
                'message' => 'حسابك غير مرتبط بملف موظف'
            ], 404);
        }

        $alreadyCheckedOut = Attendance::where('employee_id', $employee->id)
            ->whereDate('check_in', Carbon::today())
            ->whereNotNull('check_out')
            ->exists();

        if ($alreadyCheckedOut) {
            return response()->json([
                'status'  => false,
                'message' => 'لقد قمت بتسجيل الانصراف بالفعل لهذا اليوم'
            ], 422);
        }

        $att = Attendance::where('employee_id', $employee->id)
            ->whereDate('check_in', Carbon::today())
            ->whereNull('check_out')
            ->first();

        if (!$att) {
            return response()->json([
                'status'  => false,
                'message' => 'عفواً، لا يوجد سجل حضور مفتوح لهذا اليوم لتسجيل الانصراف منه.'
            ], 422);
        }

        $loc  = WorkLocation::find($request->work_location_id);
        $dist = $this->getDist($request->latitude, $request->longitude, $loc->latitude, $loc->longitude);
        $isOut = $dist > $loc->radius;

        // إنشاء أو ربط مأمورية وقت الانصراف (لو لم تُسجَّل وقت الحضور)
        $mission = $att->mission;
        $newMissionCreated = false;
        if (!$mission && $request->boolean('is_on_mission') && $request->filled('mission_description')) {
            $mission = Mission::create([
                'tenant_id'   => $user->tenant_id,
                'employee_id' => $employee->id,
                'date'        => Carbon::today(),
                'description' => $request->mission_description,
            ]);
            $newMissionCreated = true;
        }

        $outNotes = "انصراف: " . ($isOut ? "خارج النطاق بـ " . round($dist) . " متر" : "داخل النطاق");
        if ($mission && !$att->mission_id) {
            $outNotes .= " | خارج مأمورية: " . $request->mission_description;
        }

        $att->update([
            'check_out'        => Carbon::now(),
            'lat_out'          => $request->latitude,
            'long_out'         => $request->longitude,
            'is_outside_range' => $isOut,
            'notes'            => $att->notes . " | " . $outNotes,
            'mission_id'       => $mission?->id ?? $att->mission_id,
        ]);

        $deductionMessage = null;
        if ($isOut) {
            $deductionMessage = $this->applyDeduction($att->fresh());
        }

        return response()->json([
            'status'  => true,
            'message' => $deductionMessage ?? ($request->boolean('is_on_mission') ? 'تم تسجيل الانصراف بنجاح - خارج مأمورية ✅' : 'تم تسجيل الانصراف بنجاح'),
            'data'    => $att->load(['deductionSheet', 'employee.salarySheet', 'mission'])
        ]);
    }

    private function getDist($lat1, $lon1, $lat2, $lon2)
    {
        $r = 6371000;
        $p = pi() / 180;
        $a = 0.5 - cos(($lat2 - $lat1) * $p) / 2 +
            cos($lat1 * $p) * cos($lat2 * $p) * (1 - cos(($lon2 - $lon1) * $p)) / 2;
        return $r * 2 * asin(sqrt($a));
    }


    // --- CRUD للمستخدمين ---

    public function index()
    {
        $users = User::with('roles.permissions')->paginate(15);
        return response()->json([
            'status' => true,
            'data' => $users
        ]);
    }

    public function show($id)
    {
        $user = User::with('roles', 'permissions')->findOrFail($id);
        return response()->json([
            'status' => true,
            'data' => $user
        ]);
    }


    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|min:8|confirmed',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'roles' => 'sometimes|array', // استلام مصفوفة أسماء الأدوار
            'roles.*' => 'exists:roles,name', // التأكد إن الدور موجود
        ]);

        // ... كود التعامل مع الصور والباسورد كما هو ...

        $user->update($validated);

        // تحديث الأدوار (يمسح القديم ويضيف الجديد)
        if ($request->has('roles')) {
            // syncRoles بتاخد مصفوفة بأسماء الأدوار أو الـ IDs
            $user->syncRoles($request->roles);
        }
        $user->load('roles.permissions');
        return response()->json([
            'status' => true,
            'message' => 'تم تحديث بيانات المستخدم وأدواره بنجاح',
            'data' => $user // بنحملهم عشان يظهروا في الرد
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->profile_image) {
            Storage::disk('public')->delete($user->getRawOriginal('profile_image'));
        }

        $user->delete();

        return response()->json([
            'status' => true,
            'message' => 'تم حذف المستخدم بنجاح'
        ]);
    }

    // دالة لعرض سجل الحضور
    public function attendanceIndex()
    {
        $Attendance = Attendance::with('employee')->latest()->get();
        return response()->json($Attendance);
    }
}
