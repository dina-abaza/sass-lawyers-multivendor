<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InvoiceSetting;
use App\Models\ContractInvoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class ContractInvoiceController extends Controller implements HasMiddleware
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
        $invoices = ContractInvoice::with('Contract')
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
            'contract_id' => 'required|exists:contracts,id',
            'amount'  => 'required|numeric',
        ]);

        // 1. إنشاء الفاتورة باستخدام الدالة اللي عملناها في الموديل
        $invoice = ContractInvoice::createWithTax($request->all());

        // 2. جلب إعدادات المكتب (اللوجو، الاسم، العنوان)
        $settings = InvoiceSetting::first();

        // 3. الرد الشامل (الذي سيستخدمه الـ Front-end لرسم الفاتورة)
        return response()->json([
            'status' => 'success',
            'invoiceDetails' => $invoice->load('Contract'), // بيانات الفاتورة والقضية
            'InvoiceSetting' => $settings, // بيانات المكتب واللوجو والضريبة الثابتة
            'printDate' => now()->format('Y-m-d H:i')
        ]);
    }
}