<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;
use App\Models\InvoiceSetting;
use App\Models\ContractInvoice;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    /**
     * عرض كل العقود
     */
    public function index()
    {
        $contracts = Contract::with('customer', 'invoices') // جلب بيانات العميل والفواتير المرتبطة بكل عقد
            ->latest()
            ->get();

        return response()->json($contracts, 200);
    }

    /**
     * عرض عقد واحد
     */
    public function show($id)
    {
        $contract = Contract::with('customer')
            ->findOrFail($id);

        return response()->json($contract, 200);
    }

    /**
     * إنشاء عقد جديد
     */
  public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'contract_number' => 'required|string|unique:contracts,contract_number',
            'customer_id'     => 'required|exists:customers,id',
            'start_date'      => 'required|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'value'           => 'required|numeric|min:0', // جعلناه required لزوم الفاتورة
            'notes'           => 'nullable|string',
            'files.*'         => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        // معالجة رفع الملفات
        if ($request->hasFile('files')) {
            $paths = [];
            foreach ($request->file('files') as $file) {
                $paths[] = $file->store('contract_attachments', 'public');
            }
            $validated['files'] = $paths; // يتم تخزينها كمصفوفة (JSON)
        }

        try {
            return DB::transaction(function () use ($validated) {
                // 1. إنشاء العقد
                $contract = Contract::create($validated);

                // 2. إنشاء الفاتورة آلياً بناءً على قيمة العقد (Value)
                ContractInvoice::createWithTax([
                    'contract_id' => $contract->id,
                    'amount'      => $contract->value,
                ]);

                // 3. جلب الإعدادات (لتحضير بيانات الطباعة في الـ Front-end)
                $settings = InvoiceSetting::first();

                return response()->json([
                    'status'         => true,
                    'message'        => 'تم إنشاء العقد والفاتورة بنجاح',
                    'data'           => $contract->load('customer', 'invoices'), // تحميل بيانات العميل وفواتير العقد
                    'invoiceSetting' => $settings,
                    'printDate'      => now()->format('Y-m-d H:i')
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
     * تحديث عقد
     */
    public function update(Request $request, $id)
    {
        $contract = Contract::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'contract_number' => 'sometimes|string|unique:contracts,contract_number,' . $id,
            'customer_id'     => 'sometimes|exists:customers,id',
            'start_date'      => 'sometimes|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'value'           => 'nullable|numeric|min:0',
        ]);

        $contract->update($validated);

        return response()->json([
            'message' => 'تم تعديل العقد بنجاح',
            'data' => $contract
        ], 200);
    }

    /**
     * حذف عقد
     */
    public function destroy($id)
    {
        $contract = Contract::findOrFail($id);

        // حذف الملفات المرتبطة بالعقد
        if ($contract->files) {
            foreach ($contract->getRawOriginal('files') as $file) {
                if (Storage::disk('public')->exists($file)) {
                    Storage::disk('public')->delete($file);
                }
            }
        }
        $contract->delete();

        return response()->json([
            'message' => 'تم حذف العقد بنجاح'
        ], 200);
    }
}
