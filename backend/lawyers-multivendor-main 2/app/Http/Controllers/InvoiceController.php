<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use App\Models\InvoiceSetting;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class InvoiceController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view_invoices', only: ['index', 'show']),
            new Middleware('permission:create_invoices', only: ['store']),
        ];
    }

    public function index()
    {
        $invoices = Invoice::with('case')
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
            'case_id' => 'required|exists:cases,id',
            'amount'  => 'required|numeric',
        ]);

        // 1. إنشاء الفاتورة باستخدام الدالة اللي عملناها في الموديل
        $invoice = Invoice::createWithTax($request->all());

        // 2. جلب إعدادات المكتب (اللوجو، الاسم، العنوان)
        $settings = InvoiceSetting::first();

        // 3. الرد الشامل (الذي سيستخدمه الـ Front-end لرسم الفاتورة)
        return response()->json([
            'status' => 'success',
            'invoiceDetails' => $invoice->load('case'), // بيانات الفاتورة والقضية
            'InvoiceSetting' => $settings, // بيانات المكتب واللوجو والضريبة الثابتة
            'printDate' => now()->format('Y-m-d H:i')
        ]);
    }
}
