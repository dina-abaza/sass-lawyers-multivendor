<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InvoiceSetting;
use App\Models\Consultinginvoice;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class ConsultinginvoiceController extends Controller implements HasMiddleware
{  public static function middleware(): array
    {
        return [
            new Middleware('permission:view_invoices', only: ['index', 'show']),
            new Middleware('permission:create_invoices', only: ['store']),
        ];
    }

    public function index()
    {
        $invoices = Consultinginvoice::with('Consultation')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $invoices
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'amount'  => 'required|numeric',
        ]);

        // 1. إنشاء الفاتورة باستخدام الدالة اللي عملناها في الموديل
        $invoice = Consultinginvoice::createWithTax($request->all());

        // 2. جلب إعدادات المكتب (اللوجو، الاسم، العنوان)
        $settings = InvoiceSetting::first();

        // 3. الرد الشامل (الذي سيستخدمه الـ Front-end لرسم الفاتورة)
        return response()->json([
            'status' => 'success',
            'invoiceDetails' => $invoice->load('Consultation'), // بيانات الفاتورة والقضية
            'InvoiceSetting' => $settings, // بيانات المكتب واللوجو والضريبة الثابتة
            'printDate' => now()->format('Y-m-d H:i')
        ]);
    }
}
