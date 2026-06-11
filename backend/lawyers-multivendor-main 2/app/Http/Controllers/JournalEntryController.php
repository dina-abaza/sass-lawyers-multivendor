<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

class JournalEntryController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('role_or_permission:owner|accountant|access_accounting_list')
        ];
    }

    // عرض كل القيود
    public function index()
    {
        $entries = JournalEntry::with('items.account')->latest()->get();
        return response()->json($entries);
    }

    // عرض قيد واحد
    public function show($id)
    {
        $entry = JournalEntry::with('items.account')->findOrFail($id);
        return response()->json($entry);
    }

    // إنشاء قيد جديد
    public function store(Request $request)
    {
        $request->validate([
            'entry_date'        => 'required|date',
            'description'       => 'nullable|string',
            'items'             => 'required|array|min:2',
            'items.*.account_id'=> 'required|exists:accounts,id',
            'items.*.debit'     => 'required|numeric|min:0',
            'items.*.credit'    => 'required|numeric|min:0',
            'items.*.description' => 'nullable|string',
        ]);

        // التحقق إن مجموع المدين = مجموع الدائن
        $totalDebit  = collect($request->items)->sum('debit');
        $totalCredit = collect($request->items)->sum('credit');

        if ($totalDebit != $totalCredit) {
            return response()->json([
                'message' => 'مجموع المدين يجب أن يساوي مجموع الدائن'
            ], 422);
        }

        return DB::transaction(function () use ($request, $totalDebit) {
            // إنشاء رأس القيد
            $entry = JournalEntry::create([
                'entry_date'   => $request->entry_date,
                'description'  => $request->description,
                'total_amount' => $totalDebit,
            ]);

            // إنشاء السطور
            foreach ($request->items as $item) {
                $entry->items()->create([
                    'account_id'  => $item['account_id'],
                    'debit'       => $item['debit'],
                    'credit'      => $item['credit'],
                    'description' => $item['description'] ?? null,
                ]);
            }

            return response()->json([
                'message' => 'تم إنشاء القيد بنجاح',
                'data'    => $entry->load('items.account')
            ], 201);
        });
    }

    // حذف قيد
    public function destroy($id)
    {
        $entry = JournalEntry::findOrFail($id);
        $entry->delete(); // الـ items هتتحذف cascade

        return response()->json(['message' => 'تم حذف القيد بنجاح']);
    }
}
