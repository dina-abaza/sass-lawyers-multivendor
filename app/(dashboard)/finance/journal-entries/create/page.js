'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const EMPTY_ITEM = { account_id: '', debit: '', credit: '', description: '' };

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
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/finance/journal-entries"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">قيد يدوي جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorMessage error={error} />

        <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ القيد" name="entry_date" type="date" value={entry_date}
            onChange={(e) => setEntryDate(e.target.value)} required />
          <Input label="البيان العام" name="description" value={description}
            onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-right font-medium text-gray-600">الحساب</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">البيان</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">مدين</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">دائن</th>
                <th className="px-3 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <select
                      value={item.account_id}
                      onChange={(e) => updateItem(i, 'account_id', e.target.value)}
                      className="w-full h-9 rounded-lg border border-gray-300 px-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— اختر —</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)}
                      className="w-full h-9 rounded-lg border border-gray-300 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" value={item.debit} onChange={(e) => updateItem(i, 'debit', e.target.value)}
                      className="w-full h-9 rounded-lg border border-gray-300 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" value={item.credit} onChange={(e) => updateItem(i, 'credit', e.target.value)}
                      className="w-full h-9 rounded-lg border border-gray-300 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button type="button" onClick={() => removeItem(i)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={2} className="px-3 py-2 text-sm font-medium text-gray-700">الإجمالي</td>
                <td className={`px-3 py-2 text-sm font-bold ${isBalanced ? 'text-green-700' : 'text-red-600'}`}>
                  {totalDebit.toLocaleString()}
                </td>
                <td className={`px-3 py-2 text-sm font-bold ${isBalanced ? 'text-green-700' : 'text-red-600'}`}>
                  {totalCredit.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {!isBalanced && totalDebit > 0 && (
          <p className="text-sm text-red-500">الفرق: {Math.abs(totalDebit - totalCredit).toLocaleString()} — المدين والدائن يجب أن يتساويا</p>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={addItem}
            className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-4 py-2">
            + إضافة سطر
          </button>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={mutation.isPending} disabled={!isBalanced}>حفظ القيد</Button>
          <Link href="/finance/journal-entries"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
