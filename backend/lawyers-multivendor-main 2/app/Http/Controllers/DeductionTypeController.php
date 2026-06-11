<?php

namespace App\Http\Controllers;

use App\Models\DeductionType;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DeductionTypeController extends Controller implements HasMiddleware
{
     // تعريف الميدل وير
    public static function middleware(): array
    {
        return [
            new Middleware('role_or_permission:owner|access_hr_list')

        ];
    }
    public function index()
    {
        // بفضل التريت BelongsToTenant، الـ all() هنا هترجع فقط بيانات الشركة دي
        $types = DeductionType::all();

        return response()->json([
            'status' => true,
            'data' => $types
        ]);
    }

    /**
     * إضافة نوع خصم جديد (مثل: خصم تأخير، خصم بصمة خارج النطاق)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'required|numeric|min:0',
        ]);

        // ملاحظة: مش محتاجين نبعت tenant_id يدوياً لأن التريت هيضيفه تلقائياً من الـ Auth user
        $deductionType = DeductionType::create([
            'name' => $validated['name'],
            'value' => $validated['value'],
        ]);

        return response()->json([
            'status' => true,
            'message' => 'تم إضافة نوع الخصم بنجاح',
            'data' => $deductionType
        ], 201);
    }

    /**
     * تحديث نوع الخصم (لو الأونر عايز يغير السعر مثلاً)
     */
    public function update(Request $request, $id)
    {
        $type = DeductionType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'value' => 'sometimes|numeric|min:0',
        ]);

        $type->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'تم تحديث البيانات بنجاح',
            'data' => $type
        ]);
    }

    /**
     * حذف نوع خصم
     */
    public function destroy($id)
    {
        $type = DeductionType::findOrFail($id);
        $type->delete();

        return response()->json([
            'status' => true,
            'message' => 'تم الحذف بنجاح'
        ]);
    }




}
