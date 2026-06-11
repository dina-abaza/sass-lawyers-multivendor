<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use Illuminate\Http\Request;
use App\Models\InvoiceSetting;
use App\Models\Consultinginvoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class ConsultationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view_consultations', only: ['index', 'show']),
            new Middleware('permission:create_consultations', only: ['store']),
            new Middleware('permission:edit_consultations', only: ['update']),
            new Middleware('permission:delete_consultations', only: ['destroy']),
        ];
    }
    /**
     * عرض كل الاستشارات مع بيانات العملاء
     */
    public function index()
    {
        // بنستخدم with('customer') عشان نجيب اسم العميل مع كل استشارة
        $consultations = Consultation::with('customer', 'invoices')->latest()->get();

        return response()->json($consultations);
    }

    /**
     * حفظ استشارة جديدة من الشاشة
     */
   
public function store(Request $request)
{
    $validatedData = $request->validate([
        'customer_id'            => 'required|exists:customers,id',
        'consultation_type'      => 'required|in:oral,written',
        'general_classification' => 'required|in:criminal,commercial,civil,family,labor,environmental,investment,international',
        'subject'                => 'nullable|string|max:255',
        'amount'                 => 'required|numeric|min:0',
        'notes'                  => 'nullable|string',
        'description'            => 'nullable|string',
        'response_text'          => 'nullable|string',
    ]);

    try {

        return DB::transaction(function () use ($validatedData) {

            // 1️⃣ إنشاء الاستشارة
            $consultation = Consultation::create($validatedData);

            // 2️⃣ إنشاء الفاتورة الخاصة بالاستشارة
            $invoice = Consultinginvoice::createWithTax([
                'consultation_id' => $consultation->id,
                'amount'          => $validatedData['amount'],
            ]);

            // 3️⃣ جلب إعدادات الفاتورة
            $settings = InvoiceSetting::first();

            return response()->json([
                'status'         => true,
                'message'        => 'تم إنشاء الاستشارة وفاتورتها بنجاح',
                'data'           => $consultation->load('customer', 'invoices'),
                'invoiceDetails' => $invoice->load('consultation'),
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
     * عرض تفاصيل استشارة معينة
     */
    public function show($id)
    {
        $consultation = Consultation::with('customer', 'invoices')->findOrFail($id);
        return response()->json($consultation);
    }

    /**
     * تحديث الرد على الاستشارة (مفيد لخانة "الرد" في الشاشة)
     */
    public function update(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);

        $validatedData = $request->validate([
            'customer_id'            => 'sometimes|exists:customers,id',
            'consultation_type'      => 'sometimes|in:oral,written',
            'general_classification' => 'sometimes|in:criminal,commercial,civil,family,labor,environmental,investment,international',
            'subject'                => 'nullable|string|max:255',
            'amount'                 => 'nullable|numeric|min:0',
            'notes'                  => 'nullable|string',
            'description'            => 'nullable|string',
            'response_text'          => 'nullable|string',
        ]);

        $consultation->update($validatedData);

        return response()->json([
            'message' => 'تم تعديل الاستشارة بنجاح',
            'data' => $consultation->load('customer', 'invoices')
        ], 200);
    }

    /**
     * حذف استشارة
     */
    public function destroy($id)
    {
        $consultation = Consultation::findOrFail($id);
        $consultation->delete();

        return response()->json([
            'message' => 'تم حذف الاستشارة بنجاح'
        ], 200);
    }
}
