'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

function AccountNode({ account, depth = 0 }) {
  const children = account.children || [];
  return (
    <div>
      <div
        className={`flex items-center justify-between py-2 px-4 hover:bg-gray-50 border-b border-gray-100 ${depth > 0 ? 'bg-gray-50/50' : ''}`}
        style={{ paddingRight: `${16 + depth * 24}px` }}
      >
        <span className="text-sm text-gray-900 font-medium">{account.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${account.status === 'creditor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {account.status === 'creditor' ? 'دائن' : 'مدين'}
        </span>
      </div>
      {children.map((child) => (
        <AccountNode key={child.id} account={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const { tenantApi } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">شجرة الحسابات</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {list.length === 0 ? (
            <p className="p-6 text-center text-gray-500">لا توجد حسابات</p>
          ) : (
            list.map((account) => <AccountNode key={account.id} account={account} />)
          )}
        </div>
      )}
    </div>
  );
}
