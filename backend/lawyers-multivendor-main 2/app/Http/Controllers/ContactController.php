<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        // 1. التحقق من البيانات (Validation)
        $validatedData = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // 2. حفظ البيانات في الداتابيز
        Contact::create($validatedData);

        // 3. الرجوع برسالة نجاح
return response()->json([
        'status'  => true,
        'message' => 'تم استلام رسالتك بنجاح، شكرًا لتواصلك معنا!',
    ], 200);

    }
}
