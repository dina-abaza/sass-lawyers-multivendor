<?php

namespace App\Http\Controllers;

use App\Models\GeneralDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GeneralDocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $documents = GeneralDocument::latest()->paginate(10);

        return response()->json($documents);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'file_type' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],

            'files' => ['required', 'array'],
            'files.*' => ['file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:5120'],
        ]);

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $path = $file->store('general_documents', 'public');

            $uploadedFiles[] = [
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'type' => $file->getMimeType(),
            ];
        }

        $document = GeneralDocument::create([
            'file_type' => $data['file_type'],
            'description' => $data['description'] ?? null,
            'notes' => $data['notes'] ?? null,
            'files' => $uploadedFiles,
        ]);

        return response()->json([
            'message' => 'تم إضافة الملف بنجاح',
            'data' => $document,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(GeneralDocument $generalDocument)
    {
        return response()->json($generalDocument);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GeneralDocument $generalDocument)
    {
        $data = $request->validate([
            'file_type' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],

            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:5120'],
        ]);

        $files = $generalDocument->rawFilesForStorage();

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('general_documents', 'public');

                $files[] = [
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        $generalDocument->update([
            'file_type' => $data['file_type'] ?? $generalDocument->file_type,
            'description' => $data['description'] ?? $generalDocument->description,
            'notes' => $data['notes'] ?? $generalDocument->notes,
            'files' => $files,
        ]);

        return response()->json([
            'message' => 'تم تعديل الملف بنجاح',
            'data' => $generalDocument,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GeneralDocument $generalDocument)
    {
        foreach ($generalDocument->rawFilesForStorage() as $file) {
            if (is_array($file) && ! empty($file['path'])) {
                Storage::disk('public')->delete($file['path']);
            }
        }

        $generalDocument->delete();

        return response()->json([
            'message' => 'تم حذف الملف بنجاح',
        ]);
    }

    /**
     * حذف ملف واحد
     */
    public function deleteFile(GeneralDocument $generalDocument, $index)
    {
        $files = $generalDocument->rawFilesForStorage();

        if (! isset($files[$index])) {
            return response()->json(['message' => 'الملف غير موجود'], 404);
        }

        $path = $files[$index]['path'] ?? null;
        if ($path) {
            Storage::disk('public')->delete($path);
        }

        unset($files[$index]);

        $generalDocument->files = array_values($files);
        $generalDocument->save();

        return response()->json([
            'message' => 'تم حذف الملف',
            'files' => $generalDocument->files,
        ]);
    }
}
