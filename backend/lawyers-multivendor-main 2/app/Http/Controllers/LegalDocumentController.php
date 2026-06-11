<?php

namespace App\Http\Controllers;

use App\Models\LegalDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LegalDocumentController extends Controller
{
    private function withFullFileUrls(LegalDocument $document): LegalDocument
    {
        $files = $document->files;

        if (!is_array($files)) {
            return $document;
        }

        $document->setAttribute('files', array_values(array_map(function ($item) {
            if (!is_array($item)) {
                return $item;
            }

            $path = $item['path'] ?? null;
            return [
                ...$item,
                'path' => $path ? tenant_asset($path) : null,
            ];
        }, $files)));

        return $document;
    }

    private function withFullFileUrlsForMany($documents)
    {
        foreach ($documents as $document) {
            if ($document instanceof LegalDocument) {
                $this->withFullFileUrls($document);
            }
        }

        return $documents;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $documents = LegalDocument::with('customer')
            ->latest()
            ->paginate(10);

        $documents->setCollection(
            $this->withFullFileUrlsForMany($documents->getCollection())
        );

        return response()->json($documents);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'document_type' => [
                'required',
                Rule::in([
                    'general_agency',
                    'special_agency',
                    'periodic_agency',
                    'declaration',
                    'debt_settlement',
                    'legal_pledge',
                    'ownership_deed',
                    'other',
                ]),
            ],
            'agency_number' => ['nullable', 'string'],
            'document_number' => ['required', 'string', 'unique:legal_documents,document_number'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],

            // الملفات
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $uploadedFiles = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = Storage::disk('public')->putFile('legal_documents', $file);

                $uploadedFiles[] = [
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        $document = LegalDocument::create([
            ...$data,
            'files' => $uploadedFiles,
        ]);

        return response()->json([
            'message' => 'تم إنشاء الوثيقة بنجاح',
            'data' => $this->withFullFileUrls($document),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(LegalDocument $legalDocument)
    {
        return response()->json(
            $this->withFullFileUrls($legalDocument->load('customer'))
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LegalDocument $legalDocument)
    {
        $data = $request->validate([
            'document_type' => [
                'sometimes',
                Rule::in([
                    'general_agency',
                    'special_agency',
                    'periodic_agency',
                    'declaration',
                    'debt_settlement',
                    'legal_pledge',
                    'ownership_deed',
                    'other',
                ]),
            ],
            'agency_number' => ['nullable', 'string'],
            'document_number' => [
                'sometimes',
                'string',
                Rule::unique('legal_documents', 'document_number')->ignore($legalDocument->id),
            ],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],

            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $files = $legalDocument->files ?? [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = Storage::disk('public')->putFile('legal_documents', $file);

                $files[] = [
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        $legalDocument->update([
            ...$data,
            'files' => $files,
        ]);

        return response()->json([
            'message' => 'تم تحديث الوثيقة بنجاح',
            'data' => $this->withFullFileUrls($legalDocument),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LegalDocument $legalDocument)
    {
        $rawFiles = $legalDocument->getRawOriginal('files');
        $decoded = is_string($rawFiles) ? json_decode($rawFiles, true) : null;

        if (is_array($decoded)) {
            foreach ($decoded as $file) {
                if (is_array($file) && !empty($file['path'])) {
                    Storage::disk('public')->delete($file['path']);
                }
            }
        }

        $legalDocument->delete();

        return response()->json([
            'message' => 'تم حذف الوثيقة بنجاح',
        ]);
    }

    /**
     * حذف ملف واحد من الوثيقة
     */
    public function deleteFile(LegalDocument $legalDocument, $index)
    {
        $rawFiles = $legalDocument->getRawOriginal('files');
        $files = is_string($rawFiles) ? json_decode($rawFiles, true) : [];

        if (!is_array($files)) {
            $files = [];
        }

        if (!isset($files[$index])) {
            return response()->json(['message' => 'الملف غير موجود'], 404);
        }

        $path = is_array($files[$index]) ? ($files[$index]['path'] ?? null) : null;
        if ($path) {
            Storage::disk('public')->delete($path);
        }

        unset($files[$index]);
        $legalDocument->files = array_values($files);
        $legalDocument->save();

        return response()->json([
            'message' => 'تم حذف الملف بنجاح',
            'files' => $this->withFullFileUrls($legalDocument)->files,
        ]);
    }
}
