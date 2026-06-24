'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { centralApi, getTenantApi } from '@/lib/api';

function getSubdomain() {
  if (typeof window === 'undefined') return null;
  const parts = window.location.hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'localhost' && parts[0] !== 'www') {
    return parts[0];
  }
  return null;
}

const AuthContext = createContext(null);

function extractRoleNames(userData) {
  // all_roles is set by the server as plain strings via getRoleNames() — prefer it.
  // Fall back to roles[], which may be objects {id, name} from Spatie's relationship.
  const source = userData?.all_roles?.length
    ? userData.all_roles
    : (userData?.roles || []);
  return source.map((r) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const saved = localStorage.getItem('auth_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await centralApi.post('/login', { email, password });
    const token = data.token || data.access_token;
    const userData = data.user || data.data;

    const roles = extractRoleNames(userData);

    if (roles.includes('super_admin')) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
      router.replace('/admin/dashboard');
      return data;
    }

    const tenantId = userData?.tenant_id;

    if (tenantId) {
      const currentSubdomain = getSubdomain();

      if (currentSubdomain === String(tenantId)) {
        // Already on the correct subdomain — store and enter
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
        router.replace('/dashboard');
      } else {
        // Redirect to tenant subdomain, pass token via URL
        const protocol = window.location.protocol;
        const hostWithoutPort = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : '';

        // Build base domain (strip existing subdomain if any)
        const hostParts = hostWithoutPort.split('.');
        const baseDomain =
          hostParts.length >= 2 && hostParts[0] !== 'localhost'
            ? hostParts.slice(1).join('.')
            : hostWithoutPort;

        const tenantHost = `${tenantId}.${baseDomain}${port}`;
        const encodedToken = encodeURIComponent(token);
        const encodedUser = encodeURIComponent(JSON.stringify(userData));
        window.location.href = `${protocol}//${tenantHost}/auth-redirect?token=${encodedToken}&user=${encodedUser}`;
      }
    } else {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
      router.replace('/dashboard');
    }

    return data;
  }, [router]);

  const logout = useCallback(async () => {
    try {
      const logoutTenantId = getSubdomain() || user?.tenant_id;
      const api = logoutTenantId ? getTenantApi(logoutTenantId) : centralApi;
      await api.post('/logout');
    } catch {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    router.push('/login');
  }, [user, router]);

  const tenantId = getSubdomain() || user?.tenant_id;
  const tenantApi = tenantId ? getTenantApi(tenantId) : centralApi;
  const roles = extractRoleNames(user);
  const isSuperAdmin = roles.includes('super_admin');
  const isAdmin = roles.includes('admin') || isSuperAdmin;
  const isLawyer = roles.includes('lawyer');
  const hasRole = (role) => roles.includes(role);

  const updateUser = useCallback((updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem('auth_user', JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  const isOwner = roles.includes('owner');

  // Owner و super_admin عندهم كل الصلاحيات تلقائياً
  const hasPermission = useCallback((permission) => {
    if (!permission) return true;
    if (isSuperAdmin || isOwner) return true;
    const perms = user?.all_permissions ?? [];
    return perms.includes(permission);
  }, [user, isSuperAdmin, isOwner]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, tenantApi, isSuperAdmin, isAdmin, isLawyer, isOwner, hasRole, hasPermission, roles, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
