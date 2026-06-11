<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\JournalItem;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AccountStatementController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('role_or_permission:owner|accountant|access_accounting_list'),
        ];
    }

    public function index(Request $request)
    {
        $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'from'       => 'nullable|date',
            'to'         => 'nullable|date',
        ]);

        $account = Account::with('childrenRecursive')->findOrFail($request->account_id);

        $accountIds = $this->collectAccountIds($account);

        $items = JournalItem::with('journalEntry')
            ->whereIn('account_id', $accountIds)
            ->when($request->from, fn($q) => $q->whereHas('journalEntry', fn($q) => $q->whereDate('entry_date', '>=', $request->from)))
            ->when($request->to,   fn($q) => $q->whereHas('journalEntry', fn($q) => $q->whereDate('entry_date', '<=', $request->to)))
            ->get()
            ->sortBy('journalEntry.entry_date')
            ->values()
            ->map(function ($item) {
                return [
                    'date'        => $item->journalEntry->entry_date,
                    'description' => $item->journalEntry->description,
                    'debit'       => $item->debit,
                    'credit'      => $item->credit,
                ];
            });

        // حساب الرصيد التراكمي
        $balance  = 0;
        $statement = $items->map(function ($item) use (&$balance) {
            $balance += $item['debit'] - $item['credit'];
            return array_merge($item, ['balance' => $balance]);
        });

        return response()->json([
            'account'      => $account->name,
            'from'         => $request->from,
            'to'           => $request->to,
            'data'         => $statement,
            'total_debit'  => $items->sum('debit'),
            'total_credit' => $items->sum('credit'),
            'final_balance'=> $balance,
        ]);
    }

    private function collectAccountIds(Account $account): array
    {
        $ids = [$account->id];
        foreach ($account->childrenRecursive as $child) {
            $ids = array_merge($ids, $this->collectAccountIds($child));
        }
        return $ids;
    }
}
