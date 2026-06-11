<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AccountController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            // لو عايزة role أو permission
            new Middleware('role_or_permission:owner|accountant|access_accounting_list')
        ];
    }

    // GET /api/accounts
    public function index()
    {
        $accounts = Account::whereNull('parent_id')
            ->with('childrenRecursive')
            ->get();

        return response()->json($accounts);
    }

    // POST /api/accounts
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:debitor,creditor',
            'parent_id' => 'nullable|exists:accounts,id',
        ]);


        $account = Account::create($request->only([
            'name',
            'status',
            'parent_id'
        ]));

        return response()->json($account, 201);
    }

    // GET /api/accounts/{id}
    public function show($id)
    {
        $account = Account::with('childrenRecursive')->findOrFail($id);

        return response()->json($account);
    }

    // PUT /api/accounts/{id}
    public function update(Request $request, $id)
    {
        $account = Account::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:debitor,creditor',
            'parent_id' => 'nullable|exists:accounts,id',
        ]);

        // منع جعل الحساب ابن لنفسه
        if ($request->parent_id == $id) {
            return response()->json([
                'message' => 'لا يمكن جعل الحساب تابعًا لنفسه'
            ], 422);
        }

        $account->update($request->only([
            'name',
            'status',
            'parent_id'
        ]));

        return response()->json($account);
    }

    // DELETE /api/accounts/{id}
    public function destroy($id)
    {
        $account = Account::with('children')->findOrFail($id);

        // منع حذف حساب عنده فروع
        if ($account->children->count() > 0) {
            return response()->json([
                'message' => 'لا يمكن حذف حساب يحتوي على حسابات فرعية'
            ], 422);
        }

        $account->delete();

        return response()->json([
            'message' => 'تم حذف الحساب بنجاح'
        ]);
    }
}
