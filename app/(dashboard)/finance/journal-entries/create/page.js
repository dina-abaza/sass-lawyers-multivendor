'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/common/ErrorMessage';

const EMPTY_ITEM = { account_id: '', debit: '', credit: '', description: '' };

const inlineCls = 'w-full h-9 rounded-lg border border-[#E2E6F0] bg-[#F8F9FC] px-2.5 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors';

export default function CreateJournalEntryPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [entry_date, setEntryDate] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }]);
  const [error, setError] = useState(null);

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const accounts = (() => {
    const raw = Array.isArray(accountsData) ? accountsData : accountsData?.data ?? [];
    const flatten = (list) => list.reduce((acc, a) => {
      acc.push(a);
      if (a.children?.length) acc.push(...flatten(a.children));
      return acc;
    }, []);
    return flatten(raw);
  })();

  const mutation = useMutation({
    mutationFn: (data) => accountsApi.createJournalEntry(tenantApi, data),
    onSuccess: () => router.push('/finance/journal-entries'),
    onError: setError,
  });

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = (index) => {
    if (items.length <= 2) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalDebit = items.reduce((s, i) => s + (Number(i.debit) || 0), 0);
  const totalCredit = items.reduce((s, i) => s + (Number(i.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!isBalanced) {
      setError({ message: 'يجب أن يتساوى إجمالي المدين مع إجمالي الدائن' });
      return;
    }
    mutation.mutate({
      entry_date,
      description,
      items: items
        .filter((i) => i.account_id)
        .map((i) => ({
          account_id: Number(i.account_id),
          debit: Number(i.debit) || 0,
          credit: Number(i.credit) || 0,
          description: i.description,
        })),
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 10h18M3 14h18M10 6H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-3" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المالية</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>قيد يدوي جديد</h1>
            </div>
          </div>
          <Link href="/finance/journal-entries"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorMessage error={error} />

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="w-full h-1 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="تاريخ القيد" name="entry_date" type="date" value={entry_date}
              onChange={(e) => setEntryDate(e.target.value)} required />
            <Input label="البيان العام" name="description" value={description}
              onChange={(e) => setDescription(e.target.value)} required />
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                <tr>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">الحساب</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">البيان</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">مدين</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">دائن</th>
                  <th className="px-3 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {items.map((item, i) => (
                  <tr key={i} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-3 py-2.5">
                      <select value={item.account_id}
                        onChange={(e) => updateItem(i, 'account_id', e.target.value)}
                        className={inlineCls}>
                        <option value="">— اختر —</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)}
                        className={inlineCls} />
                    </td>
                    <td className="px-3 py-2.5">
                      <input type="number" min="0" value={item.debit} onChange={(e) => updateItem(i, 'debit', e.target.value)}
                        className={inlineCls} />
                    </td>
                    <td className="px-3 py-2.5">
                      <input type="number" min="0" value={item.credit} onChange={(e) => updateItem(i, 'credit', e.target.value)}
                        className={inlineCls} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button type="button" onClick={() => removeItem(i)}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 transition-colors mx-auto text-base leading-none">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: '#F0F4FA' }} className="border-t-2 border-[#E2E6F0]">
                <tr>
                  <td colSpan={2} className="px-3 py-3 text-sm font-bold text-[#0A1628]">الإجمالي</td>
                  <td className={`px-3 py-3 text-sm font-bold ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalDebit.toLocaleString()}
                  </td>
                  <td className={`px-3 py-3 text-sm font-bold ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalCredit.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {!isBalanced && totalDebit > 0 && (
          <p className="text-sm text-red-500 px-1">الفرق: {Math.abs(totalDebit - totalCredit).toLocaleString()} — المدين والدائن يجب أن يتساويا</p>
        )}

        <div className="flex items-center gap-3">
          <button type="button" onClick={addItem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة سطر
          </button>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending || !isBalanced}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
            {mutation.isPending
              ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            حفظ القيد
          </button>
          <Link href="/finance/journal-entries"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
