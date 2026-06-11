<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\PaymentVoucher;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

class PaymentVoucherController extends Controller implements HasMiddleware
{
    /**
     * تعريف الـ Middleware الخاص بالكنترولر
     */
    public static function middleware(): array
    {
        return [
            // 1. التأكد من تسجيل الدخول أولاً (Bearer Token)

            // 2. ربط العمليات بالصلاحيات الموجودة في الـ Seeder الخاص بك
            new Middleware('permission:view_vouchers', only: ['index', 'show']),
            new Middleware('permission:create_vouchers', only: ['store']),
            new Middleware('permission:edit_vouchers', only: ['update']),
            new Middleware('permission:delete_vouchers', only: ['destroy']),
        ];
    }
    public function index()
    {
        return PaymentVoucher::with('customer')
            ->latest()
            ->paginate(10);
    }

public function store(Request $request)
{
    $data = $request->validate([
        'customer_id'        => ['required', 'exists:customers,id'],
        'voucher_date'       => ['required', 'date'],
        'voucher_date_hijri' => ['nullable', 'string'],
        'amount'             => ['required', 'numeric'],
        'amount_text'        => ['required', 'string'],
        'is_check'           => ['boolean'],
        'bank'               => ['nullable', 'string'],
        'for_reason'         => ['nullable', 'string'],
        'notes'              => ['nullable', 'string'],
    ]);

    return DB::transaction(function () use ($data) {

        // 1. إنشاء سند الصرف
        $voucher = PaymentVoucher::create($data);

        // 2. جيب الحسابات
        $expenseAccount = Account::where('name', 'مصروفات عامة')->first();
        $cashAccount    = Account::where('name', 'الصندوق')->first();

        // 3. إنشاء القيد
        $entry = JournalEntry::create([
            'entry_date'   => $voucher->voucher_date,
            'description'  => 'سند صرف رقم ' . $voucher->id,
            'total_amount' => $voucher->amount,
        ]);

        // 4. سطور القيد
        // مدين: مصروفات عامة
        $entry->items()->create([
            'account_id'  => $expenseAccount->id,
            'debit'       => $voucher->amount,
            'credit'      => 0,
            'description' => 'مصروف عام',
        ]);

        // دائن: الصندوق
        $entry->items()->create([
            'account_id'  => $cashAccount->id,
            'debit'       => 0,
            'credit'      => $voucher->amount,
            'description' => 'صرف من الصندوق',
        ]);

        // 5. ربط القيد بسند الصرف
        $voucher->update(['journal_entry_id' => $entry->id]);

        return response()->json([
            'message' => 'تم إضافة سند الصرف',
            'data'    => $voucher->load('customer'),
        ], 201);
    });
}

    public function show(PaymentVoucher $paymentVoucher)
    {
        return $paymentVoucher->load('customer');
    }

    public function update(Request $request, PaymentVoucher $paymentVoucher)
    {
        $data = $request->validate([
            'customer_id' => ['sometimes', 'exists:customers,id'],
            'voucher_date' => ['sometimes', 'date'],
            'voucher_date_hijri' => ['nullable', 'string'],
            'amount' => ['sometimes', 'numeric'],
            'amount_text' => ['sometimes', 'string'],
            'is_check' => ['boolean'],
            'bank' => ['nullable', 'string'],
            'for_reason' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $paymentVoucher->update($data);

        return response()->json([
            'message' => 'تم تعديل سند الصرف',
            'data' => $paymentVoucher,
        ]);
    }

    public function destroy(PaymentVoucher $paymentVoucher)
    {
        $paymentVoucher->delete();

        return response()->json([
            'message' => 'تم حذف سند الصرف',
        ]);
    }
}
