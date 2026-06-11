<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InvoiceSetting;

class InvoiceSettingController extends Controller
{
    public function show()
    {
        return response()->json(
            InvoiceSetting::first()
        );
    }

    public function storeOrUpdate(Request $request)
    {
        $data = $request->validate([
            'office_name' => 'required|string',
            'tax_number'  => 'nullable|string',
            'tax_percentage' => 'required|numeric|min:0',
            'phone'       => 'nullable|string',
            'address'     => 'nullable|string',
            'logo'        => 'nullable|image'
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $setting = InvoiceSetting::updateOrCreate(
            [],
            $data
        );

        return response()->json([
            'message' => 'Invoice settings saved successfully',
            'data' => $setting
        ]);
    }
}

