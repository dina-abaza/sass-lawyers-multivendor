<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Invoice;
use App\Models\LegalCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class LegalCaseController extends Controller implements HasMiddleware
{
    private function withFullFileUrls(LegalCase $case): LegalCase
    {
        $files = $case->files;

        if (is_array($files)) {
            $case->setAttribute('files', array_values(array_map(
                fn ($path) => $path ? tenant_asset($path) : null,
                $files
            )));
        } elseif (is_string($files) && $files !== '') {
            $case->setAttribute('files', tenant_asset($files));
        }

        return $case;
    }

    private function withFullFileUrlsForMany($cases)
    {
        foreach ($cases as $case) {
            if ($case instanceof LegalCase) {
                $this->withFullFileUrls($case);
            }
        }

        return $cases;
    }

    public static function middleware(): array
    {
        return [
            new Middleware('permission:view_cases', only: ['index', 'show']),
            new Middleware('permission:create_cases', only: ['store']),
            new Middleware('permission:edit_cases', only: ['update']),
            new Middleware('permission:delete_cases', only: ['destroy']),
            new Middleware('permission:view_cases_archive', only: ['archiveCases']),
            new Middleware('permission:view_lawyer_reports', only: ['lawyerReport']),
        ];
    }
    /**
     * عرض كل القضايا
     */
    public function index()
    {
        $cases = LegalCase::with(['customer', 'lawyer', 'status','Contract'])
            ->latest()
            ->get();

        return response()->json($this->withFullFileUrlsForMany($cases), 200);
    }

    public function archiveCases()
    {
        $archiveCases = LegalCase::with(['customer', 'lawyer', 'status'])
            ->whereHas('status', function ($query) {
                $query->where('name', 'ارشيف');
            })
            ->latest()
            ->get();

        return response()->json($this->withFullFileUrlsForMany($archiveCases), 200);
    }

    /**
     * عرض قضية واحدة
     */
    public function show($id)
    {
        $case = LegalCase::with(['customer', 'lawyer', 'status'])
            ->findOrFail($id);

        return response()->json($this->withFullFileUrls($case), 200);
    }

    /**
     * إنشاء قضية جديدة
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_number'     => 'required|string|unique:cases,case_number',
            'agency'          => 'nullable|string',
            'office'          => 'nullable|string',
            'type'            => 'nullable|string',
            'contract_name'   => 'nullable|string',
            'lawyer_id'         => 'required|exists:users,id',
            'customer_id'     => 'required|exists:customers,id',
            'contract_id' => 'nullable|exists:contracts,id',

            'value'           => 'nullable|numeric',
            'subject'         => 'nullable|string',
            'case_status_id'  => 'required|exists:case_statuses,id',
            'opponent_name'   => 'nullable|string',
            'date'            => 'nullable|date',
            'date_hijri'      => 'nullable|string',
            'notes'           => 'nullable|string',
            'files.*'         => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        // رفع ملفات متعددة
        if ($request->hasFile('files')) {
            $paths = [];
            foreach ($request->file('files') as $file) {
                $paths[] = $file->store('case_attachments', 'public');
            }
            $validated['files'] = $paths;
        }
        try {
            return DB::transaction(function () use ($validated) {
                $validated['user_id'] = $validated['lawyer_id'];
                // 1. إنشاء القضية
                $case = LegalCase::create($validated);

                // 2. إنشاء الفاتورة آلياً باستخدام الدالة المساعدة في الموديل الخاص بكِ
                Invoice::createWithTax([
                    'case_id' => $case->id,
                    'amount'  => $case->value, // سحب القيمة من القضية المنشأة
                ]);

                return response()->json([
                    'status'  => true,
                    'message' => 'تم إنشاء القضية والفاتورة بنجاح',
                    'data'    => $this->withFullFileUrls($case->load('invoice')) // إرجاع القضية مع بيانات فاتورتها
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'حدث خطأ أثناء الحفظ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث قضية
     */
    public function update(Request $request, $id)
    {
        $case = LegalCase::findOrFail($id);

        $validated = $request->validate([
            'case_number'     => 'sometimes|string|unique:cases,case_number,' . $id,
            'agency'          => 'nullable|string',
            'office'          => 'nullable|string',
            'type'            => 'nullable|string',
            'contract_name'   => 'nullable|string',
            'lawyer_id'         => 'sometimes|exists:users,id',
            'customer_id'     => 'sometimes|exists:customers,id',
            'value'           => 'nullable|numeric',
            'subject'         => 'nullable|string',
            'case_status_id'  => 'sometimes|exists:case_statuses,id',
            'opponent_name'   => 'nullable|string',
            'date'            => 'nullable|date',
            'date_hijri'      => 'nullable|string',
            'notes'           => 'nullable|string',
            'files.*'         => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        // لو فيه ملفات جديدة → نضيفهم (من غير مسح القديم)
        if ($request->hasFile('files')) {
            $paths = $case->files ?? [];

            foreach ($request->file('files') as $file) {
                $paths[] = $file->store('case_attachments', 'public');
            }

            $validated['files'] = $paths;
        }

        $case->update($validated);

        return response()->json([
            'message' => 'تم تعديل القضية بنجاح',
            'data' => $this->withFullFileUrls($case)
        ], 200);
    }

    /**
     * حذف قضية
     */
    public function destroy($id)
    {
        $case = LegalCase::findOrFail($id);

        // حذف الملفات
        if ($case->files) {
            foreach ($case->files as $file) {
                if (Storage::disk('public')->exists($file)) {
                    Storage::disk('public')->delete($file);
                }
            }
        }

        $case->delete();

        return response()->json([
            'message' => 'تم حذف القضية بنجاح'
        ], 200);
    }

public function getAllLawyers()
    {
        $lawyers = User::with('roles.permissions')
            ->whereHas('roles', function ($query) {
                $query->where('name', 'lawyer');
            })
            ->get();

        return response()->json([
            'status' => true,
            'data' => $lawyers
        ]);
    }

  public function getLawyerById($id)
{
    // تحميل المحامي ومعه القضايا.. وكل قضية معها (العميل، الحالة، الجلسات، الفاتورة)
    $user = User::with('cases')->find($id);

    if (!$user) {
        return response()->json([
            'status' => false,
            'message' => 'المحامي غير موجود'
        ], 404);
    }

    return response()->json([
        'status' => true,
        'data' => $user
    ], 200);
}
}
