<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class NotificationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:send_notifications', only: ['send']),
        ];
    }

    // 1. إرسال إشعار لواحد أو أكثر من المستخدمين
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_ids'   => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'title'      => 'required|string|max:255',
            'message'    => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->user_ids as $userId) {
            Notification::create([
                'user_id' => $userId,
                'title'   => $request->title,
                'message' => $request->message,
            ]);
        }

        return response()->json(['message' => 'Notifications sent successfully'], 201);
    }

    // 2. جلب إشعارات المستخدم الحالي
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->latest()
            ->get();

        if ($notifications->isEmpty()) {
            return response()->json([
                'message' => 'Your notification tray is empty',
                'data'    => []
            ], 200);
        }

        return response()->json(['data' => $notifications], 200);
    }

    // 3. قراءة إشعار واحد
    public function markAsRead($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    // 4. قراءة الكل
    public function markAllAsRead()
    {
        $updatedRows = Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        if ($updatedRows === 0) {
            return response()->json(['message' => 'No unread notifications found'], 404);
        }

        return response()->json(['message' => 'All notifications marked as read']);
    }

    // 5. حذف إشعار واحد
    public function destroy($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found or unauthorized'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted successfully']);
    }

    // 6. حذف الكل
    public function destroyAll()
    {
     
        $deletedRows = Notification::where('user_id', auth()->id())->delete();

        if ($deletedRows === 0) {
            return response()->json(['message' => 'No notifications found to delete'], 404);
        }

        return response()->json(['message' => 'All notifications deleted successfully']);
    }
}
