<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TrialBalanceController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
// لو عايزة role أو permission
new Middleware('role_or_permission:owner|accountant|access_accounting_list')        ];
    }
    public function index()
    {
        $accounts = Account::with('journalItems')
            ->get()
            ->map(function ($account) {
                $totalDebit  = $account->journalItems->sum('debit');
                $totalCredit = $account->journalItems->sum('credit');
                $balance     = $totalDebit - $totalCredit;

                return [
                    'account_id'   => $account->id,
                    'account_name' => $account->name,
                    'status'       => $account->status,
                    'total_debit'  => $totalDebit,
                    'total_credit' => $totalCredit,
                    'balance'      => abs($balance),
                    'balance_type' => $balance > 0 ? 'مدين' : ($balance < 0 ? 'دائن' : 'صفر'),
                ];
            })
            ->filter(fn($account) => $account['total_debit'] > 0 || $account['total_credit'] > 0); // بس الحسابات اللي فيها حركة

        $totalDebit  = $accounts->sum('total_debit');
        $totalCredit = $accounts->sum('total_credit');

        return response()->json([
            'data'         => $accounts->values(),
            'total_debit'  => $totalDebit,
            'total_credit' => $totalCredit,
            'is_balanced'  => $totalDebit === $totalCredit, // المدين = الدائن ✅
        ]);
    }
}
