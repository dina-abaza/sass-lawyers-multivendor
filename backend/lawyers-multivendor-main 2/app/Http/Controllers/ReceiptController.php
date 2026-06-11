<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

class ReceiptController extends Controller implements HasMiddleware
{

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
        return Receipt::with('customer')
            ->latest()
            ->paginate(10);
    }

   public function store(Request $request)
{
    $data = $request->validate([
        'customer_id'        => ['required', 'exists:customers,id'],
        'receipt_date'       => ['required', 'date'],
        'receipt_date_hijri' => ['nullable', 'string'],
        'amount'             => ['required', 'numeric'],
        'amount_text'        => ['required', 'string'],
        'is_check'           => ['boolean'],
        'bank'               => ['nullable', 'string'],
        'for_reason'         => ['nullable', 'string'],
        'notes'              => ['nullable', 'string'],
    ]);

    return DB::transaction(function () use ($data) {

        // 1. إنشاء سند القبض
        $receipt = Receipt::create($data);

        // 2. جيب الحسابات
        $cashAccount   = Account::where('name', 'الصندوق')->first();
        $clientAccount = Account::where('name', 'عملاء القضايا')->first();

        // 3. إنشاء القيد
        $entry = JournalEntry::create([
            'entry_date'   => $receipt->receipt_date,
            'description'  => 'سند قبض رقم ' . $receipt->id,
            'total_amount' => $receipt->amount,
        ]);

        // 4. سطور القيد
        // مدين: الصندوق
        $entry->items()->create([
            'account_id'  => $cashAccount->id,
            'debit'       => $receipt->amount,
            'credit'      => 0,
            'description' => 'استلام مبلغ من العميل',
        ]);

        // دائن: عملاء القضايا
        $entry->items()->create([
            'account_id'  => $clientAccount->id,
            'debit'       => 0,
            'credit'      => $receipt->amount,
            'description' => 'سداد العميل',
        ]);

        // 5. ربط القيد بسند القبض
        $receipt->update(['journal_entry_id' => $entry->id]);

        return response()->json([
            'message' => 'تم إضافة سند القبض',
            'data'    => $receipt->load('customer'),
        ], 201);
    });
}

    public function show(Receipt $receipt)
    {
        return $receipt->load('customer');
    }

    public function update(Request $request, Receipt $receipt)
    {
        $data = $request->validate([
            'customer_id' => ['sometimes', 'exists:customers,id'],
            'receipt_date' => ['sometimes', 'date'],
            'receipt_date_hijri' => ['nullable', 'string'],
            'amount' => ['sometimes', 'numeric'],
            'amount_text' => ['sometimes', 'string'],
            'is_check' => ['boolean'],
            'bank' => ['nullable', 'string'],
            'for_reason' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $receipt->update($data);

        return response()->json([
            'message' => 'تم تعديل سند القبض',
            'data' => $receipt,
        ]);
    }

    public function destroy(Receipt $receipt)
    {
        $receipt->delete();

        return response()->json([
            'message' => 'تم حذف سند القبض',
        ]);
    }
}
