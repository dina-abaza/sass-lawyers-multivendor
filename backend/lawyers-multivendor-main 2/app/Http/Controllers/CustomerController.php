<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Storage;

class CustomerController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view_customers', only: ['index', 'show']),
            new Middleware('permission:create_customers', only: ['store']),
            new Middleware('permission:edit_customers', only: ['update']),
            new Middleware('permission:delete_customers', only: ['destroy']),
        ];
    }

    public function index()
    {
        $customers = Customer::latest()->get()->map(function ($customer) {
            // تحويل المسار لرابط كامل لكل عميل في القائمة
            if ($customer->getRawOriginal('files')) {
                $customer->files = tenant_asset($customer->getRawOriginal('files'));
            }
            return $customer;
        });

        return response()->json($customers, 200);
    }

    public function show($id)
    {
        $customer = Customer::with('cases')->findOrFail($id);

        // استخدام getRawOriginal لضمان الحصول على المسار من القاعدة مباشرة قبل التحويل
        $filePath = $customer->getRawOriginal('files');
        if ($filePath) {
            $customer->files = tenant_asset($filePath);
        }

        return response()->json($customer, 200);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name'             => 'required|string|max:255',
            'national_id'      => 'required|unique:customers,national_id',
            'email'            => 'nullable|email|unique:customers,email',
            'mobile'           => 'required',
            'customer_type'    => 'nullable|string',
            'job'              => 'nullable|string',
            'address'          => 'nullable|string',
            'birth_date'       => 'nullable|date',
            'birth_date_hijri' => 'nullable|string',
            'gender'           => 'nullable|string',
            'phone'            => 'nullable|string',
            'status'           => 'nullable|string',
            'notes'            => 'nullable|string',
            'files'            => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        if ($request->hasFile('files')) {
            // تخزين الملف في القرص العام الخاص بالـ Tenant
            $path = $request->file('files')->store('customer_attachments', 'public');
            $validatedData['files'] = $path;
        }

        $customer = Customer::create($validatedData);

        // إرجاع الكائن مع الرابط الكامل فوراً بعد الحفظ
        if ($customer->files) {
            $customer->files = tenant_asset($customer->files);
        }

        return response()->json([
            'message' => 'تم حفظ العميل بنجاح',
            'customer' => $customer
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validatedData = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'national_id'      => 'sometimes|unique:customers,national_id,' . $id,
            'email'            => 'nullable|email|unique:customers,email,' . $id,
            'mobile'           => 'sometimes|string',
            'customer_type'    => 'nullable|string',
            'job'              => 'nullable|string',
            'address'          => 'nullable|string',
            'birth_date'       => 'nullable|date',
            'birth_date_hijri' => 'nullable|string',
            'gender'           => 'nullable|string',
            'phone'            => 'nullable|string',
            'status'           => 'nullable|string',
            'notes'            => 'nullable|string',
            'files'            => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        if ($request->hasFile('files')) {
            // حذف القديم باستخدام المسار الخام (Raw Path)
            $oldPath = $customer->getRawOriginal('files');
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            $validatedData['files'] = $request->file('files')->store('customer_attachments', 'public');
        }

        $customer->update($validatedData);

        // تحويل المسار الجديد لرابط كامل قبل الرد
        if ($customer->files) {
            $customer->files = tenant_asset($customer->getRawOriginal('files'));
        }

        return response()->json([
            'message' => 'تم تعديل بيانات العميل بنجاح',
            'data' => $customer
        ], 200);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);

        if ($customer->consultations()->exists()) {
            return response()->json([
                'message' => 'لا يمكن حذف العميل لوجود استشارات مرتبطة به.'
            ], 422);
        }

        $filePath = $customer->getRawOriginal('files');
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }

        $customer->delete();

        return response()->json([
            'message' => 'تم حذف العميل بنجاح'
        ], 200);
    }
}
