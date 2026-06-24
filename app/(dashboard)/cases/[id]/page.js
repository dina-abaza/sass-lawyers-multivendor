'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { casesApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import Spinner from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

export default function CaseDetailPage({ params }) {
  const { id } = use(params);
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data: legalCase, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => tenantApi.get(`/cases/${id}`).then((r) => r.data),
    enabled: !!tenantApi,
    onSuccess: (d) => setForm(d),
  });

  const { data: statuses } = useQuery({
    queryKey: [QUERY_KEYS.CASE_STATUSES],
    queryFn: () => casesApi.getStatuses(tenantApi).then((r) => r.data),
    enabled: !!tenantApi && editing,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => tenantApi.post(`/cases-updated/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['case', id] });
      qc.invalidateQueries({ queryKey: ['cases'] });
      setEditing(false);
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>;
  if (!legalCase) return null;

  const displayCase = form || legalCase;

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/cases">
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            قضية رقم {legalCase.case_number}
          </h1>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => { setForm({ ...legalCase }); setEditing(true); }}>
            تعديل
          </Button>
        )}
      </div>

      <ErrorMessage error={error} />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {editing ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              updateMutation.mutate(form);
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="رقم القضية" name="case_number" value={form?.case_number || ''} onChange={handleChange} />
              <Input label="التاريخ" name="date" type="date" value={form?.date?.slice(0, 10) || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الجهة" name="agency" value={form?.agency || ''} onChange={handleChange} />
              <Input label="المحكمة" name="office" value={form?.office || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الخصم" name="opponent_name" value={form?.opponent_name || ''} onChange={handleChange} />
              <Input label="قيمة القضية" name="value" type="number" value={form?.value || ''} onChange={handleChange} />
            </div>
            <Select
              label="الحالة"
              name="case_status_id"
              value={form?.case_status_id || ''}
              onChange={handleChange}
              options={toOptions(statuses)}
            />
            <Input label="الموضوع" name="subject" value={form?.subject || ''} onChange={handleChange} />
            <Textarea label="ملاحظات" name="notes" value={form?.notes || ''} onChange={handleChange} />
            <div className="flex gap-3">
              <Button type="submit" loading={updateMutation.isPending}>حفظ التغييرات</Button>
              <Button variant="outline" onClick={() => setEditing(false)} type="button">إلغاء</Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { label: 'رقم القضية', value: legalCase.case_number },
              { label: 'العميل', value: legalCase.customer?.name },
              { label: 'الحالة', value: legalCase.status?.name },
              { label: 'التاريخ', value: legalCase.date ? new Date(legalCase.date).toLocaleDateString('ar-SA') : null },
              { label: 'الجهة', value: legalCase.agency },
              { label: 'المحكمة', value: legalCase.office },
              { label: 'الخصم', value: legalCase.opponent_name },
              { label: 'قيمة القضية', value: legalCase.value ? `${legalCase.value} ر.س` : null },
              { label: 'الموضوع', value: legalCase.subject },
              { label: 'ملاحظات', value: legalCase.notes },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-gray-500 mb-1">{label}</dt>
                <dd className="text-sm font-medium text-gray-900">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
