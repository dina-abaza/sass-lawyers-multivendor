'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { generalDocsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function GeneralDocumentsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['general-documents'],
    queryFn: () => generalDocsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => generalDocsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['general-documents'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">المستندات العامة</h1>
        <Link href="/documents/general/create"><Button>+ مستند جديد</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد مستندات</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{d.file_type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                </div>
                <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(d.id); }}
                  className="text-red-500 hover:text-red-700 text-xs">حذف</button>
              </div>
              {d.files?.length > 0 && (
                <p className="text-xs text-gray-400">{d.files.length} ملف مرفق</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
