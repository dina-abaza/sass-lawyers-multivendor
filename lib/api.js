import axios from 'axios';

const CENTRAL_URL = process.env.NEXT_PUBLIC_CENTRAL_API_URL || 'http://localhost:8000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function createClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    delete config.headers['Cache-Control'];
    delete config.headers['Pragma'];
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      const isAuthPage = typeof window !== 'undefined' &&
        ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password']
          .some((p) => window.location.pathname.startsWith(p));
      if (err.response?.status === 401 && typeof window !== 'undefined' && !isAuthPage) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );

  return client;
}

export const centralApi = createClient(`${CENTRAL_URL}/api`);

export function getTenantApi(tenantId) {
  const tenantUrl = CENTRAL_URL.replace('://', `://${tenantId}.`);
  return createClient(`${tenantUrl}/api`);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => centralApi.post('/login', data),
  register: (data) => centralApi.post('/register', data),
  logout: () => centralApi.post('/logout'),
  forgotPassword: (data) => centralApi.post('/forgot-password', data),
  verifyOtp: (data) => centralApi.post('/verify-otp', data),
  resetPassword: (data) => centralApi.post('/reset-password', data),
  changePassword: (api, data) => api.post('/change-password', data),
  updateProfile: (api, data) => api.post('/profile/update', data),
};

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers: () => centralApi.get('/admin/users'),
  getUser: (id) => centralApi.get(`/admin/users/${id}`),
  createUser: (data) => centralApi.post('/admin/users/store', data),
  updateUser: (id, data) => centralApi.put(`/admin/users/${id}`, data),
  deleteUser: (id) => centralApi.delete(`/admin/users/${id}`),
  getPendingVendors: () => centralApi.get('/admin/pending-vendors'),
  approveVendor: (id) => centralApi.post(`/admin/approve-vendor/${id}`),
  rejectVendor: (id) => centralApi.post(`/admin/reject-vendor/${id}`),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: (api) => api.get('/customers'),
  getById: (api, id) => api.get(`/customers/${id}`),
  create: (api, data) => api.post('/customers', data),
  update: (api, id, data) => api.put(`/customers/${id}`, data),
  delete: (api, id) => api.delete(`/customers/${id}`),
};

// ─── Cases ────────────────────────────────────────────────────────────────────
export const casesApi = {
  getAll: (api) => api.get('/cases'),
  getArchived: (api) => api.get('/cases-archive'),
  getById: (api, id) => api.get(`/cases/${id}`),
  create: (api, data) => api.post('/cases', data),
  update: (api, id, data) => api.put(`/cases/${id}`, data),
  delete: (api, id) => api.delete(`/cases/${id}`),
  getStatuses: (api) => api.get('/case-statuses'),
  createStatus: (api, data) => api.post('/case-statuses', data),
  updateStatus: (api, id, data) => api.put(`/case-statuses/${id}`, data),
  deleteStatus: (api, id) => api.delete(`/case-statuses/${id}`),
  getLawyers: (api) => api.get('/lawyers'),
  getLawyer: (api, id) => api.get(`/lawyers/${id}`),
};

// ─── Consultations ────────────────────────────────────────────────────────────
export const consultationsApi = {
  getAll: (api) => api.get('/consultations'),
  getById: (api, id) => api.get(`/consultations/${id}`),
  create: (api, data) => api.post('/consultations', data),
  update: (api, id, data) => api.put(`/consultations/${id}`, data),
  respond: (api, id, data) => api.put(`/consultations/${id}`, data),
  delete: (api, id) => api.delete(`/consultations/${id}`),
};

// ─── Contracts ────────────────────────────────────────────────────────────────
export const contractsApi = {
  getAll: (api) => api.get('/contracts'),
  getById: (api, id) => api.get(`/contracts/${id}`),
  create: (api, data) => api.post('/contracts', data),
  update: (api, id, data) => api.put(`/contracts/${id}`, data),
  delete: (api, id) => api.delete(`/contracts/${id}`),
};

// ─── Court Sessions ───────────────────────────────────────────────────────────
export const sessionsApi = {
  getAll: (api) => api.get('/sessions'),
  getById: (api, id) => api.get(`/sessions/${id}`),
  create: (api, data) => api.post('/sessions', data),
  update: (api, id, data) => api.post(`/sessions/${id}`, data),
  delete: (api, id) => api.delete(`/sessions/${id}`),
};

// ─── Departments ──────────────────────────────────────────────────────────────
export const departmentsApi = {
  getAll: (api) => api.get('/departments'),
  getById: (api, id) => api.get(`/departments/${id}`),
  create: (api, data) => api.post('/departments', data),
  update: (api, id, data) => api.put(`/departments/${id}`, data),
  delete: (api, id) => api.delete(`/departments/${id}`),
};

// ─── Employees ────────────────────────────────────────────────────────────────
export const employeesApi = {
  getAll: (api) => api.get('/employees'),
  getById: (api, id) => api.get(`/employees/${id}`),
  create: (api, data) => api.post('/employees', data),
  update: (api, id, data) => api.put(`/employees/${id}`, data),
  delete: (api, id) => api.delete(`/employees/${id}`),
  sendStaffMessage: (api, data) => api.post('/send-staff-message', data),
  sendDirectMessage: (api, data) => api.post('/send-direct-message', data),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll: (api) => api.get('/tasks'),
  getArchived: (api) => api.get('/tasks-archive'),
  getById: (api, id) => api.get(`/tasks/${id}`),
  create: (api, data) => api.post('/tasks', data),
  update: (api, id, data) => api.put(`/tasks/${id}`, data),
  delete: (api, id) => api.delete(`/tasks/${id}`),
};

// ─── Wakalas ──────────────────────────────────────────────────────────────────
export const wakalasApi = {
  getAll: (api) => api.get('/wakalas'),
  getById: (api, id) => api.get(`/wakalas/${id}`),
  create: (api, data) => api.post('/wakalas', data),
  update: (api, id, data) => api.put(`/wakalas/${id}`, data),
  delete: (api, id) => api.delete(`/wakalas/${id}`),
};

// ─── Legal Documents ──────────────────────────────────────────────────────────
export const legalDocsApi = {
  getAll: (api) => api.get('/legal-documents'),
  getById: (api, id) => api.get(`/legal-documents/${id}`),
  create: (api, data) => api.post('/legal-documents', data),
  update: (api, id, data) => api.post(`/legal-documents/${id}`, data),
  delete: (api, id) => api.delete(`/legal-documents/${id}`),
  deleteFile: (api, docId, fileId) => api.delete(`/legal-documents/${docId}/files/${fileId}`),
};

// ─── General Documents ────────────────────────────────────────────────────────
export const generalDocsApi = {
  getAll: (api) => api.get('/general-documents'),
  getById: (api, id) => api.get(`/general-documents/${id}`),
  create: (api, data) => api.post('/general-documents', data),
  update: (api, id, data) => api.post(`/general-documents/${id}`, data),
  delete: (api, id) => api.delete(`/general-documents/${id}`),
  deleteFile: (api, docId, fileId) => api.delete(`/general-documents/${docId}/files/${fileId}`),
};

// ─── Finance – Invoices ───────────────────────────────────────────────────────
export const invoicesApi = {
  getAll: (api) => api.get('/invoices'),
  create: (api, data) => api.post('/invoices', data),
  getContractInvoices: (api) => api.get('/contract-invoices'),
  createContractInvoice: (api, data) => api.post('/contract-invoices', data),
  getConsultingInvoices: (api) => api.get('/consulting-invoices'),
  createConsultingInvoice: (api, data) => api.post('/consulting-invoices', data),
};

// ─── Finance – Receipts ───────────────────────────────────────────────────────
export const receiptsApi = {
  getAll: (api) => api.get('/receipts'),
  create: (api, data) => api.post('/receipts', data),
  update: (api, id, data) => api.put(`/receipts/${id}`, data),
  delete: (api, id) => api.delete(`/receipts/${id}`),
};

// ─── Finance – Payment Vouchers ───────────────────────────────────────────────
export const paymentVouchersApi = {
  getAll: (api) => api.get('/payment-vouchers'),
  create: (api, data) => api.post('/payment-vouchers', data),
  update: (api, id, data) => api.put(`/payment-vouchers/${id}`, data),
  delete: (api, id) => api.delete(`/payment-vouchers/${id}`),
};

// ─── Finance – Salary Sheets ──────────────────────────────────────────────────
export const salaryApi = {
  getAll: (api) => api.get('/salary-sheets'),
  create: (api, data) => api.post('/salary-sheets', data),
  update: (api, id, data) => api.put(`/salary-sheets/${id}`, data),
  delete: (api, id) => api.delete(`/salary-sheets/${id}`),
};

// ─── Finance – Accounts ───────────────────────────────────────────────────────
export const accountsApi = {
  getAll: (api) => api.get('/accounts'),
  getById: (api, id) => api.get(`/accounts/${id}`),
  create: (api, data) => api.post('/accounts', data),
  update: (api, id, data) => api.put(`/accounts/${id}`, data),
  delete: (api, id) => api.delete(`/accounts/${id}`),
  getJournalEntries: (api) => api.get('/journal-entries'),
  getJournalEntry: (api, id) => api.get(`/journal-entries/${id}`),
  createJournalEntry: (api, data) => api.post('/journal-entries', data),
  deleteJournalEntry: (api, id) => api.delete(`/journal-entries/${id}`),
  getTrialBalance: (api) => api.get('/trial-balance'),
  getAccountStatement: (api, params) => api.get('/account-statement', { params }),
};

// ─── Invoice Settings ─────────────────────────────────────────────────────────
export const invoiceSettingsApi = {
  get: (api) => api.get('/invoice-settings'),
  update: (api, data) => api.post('/invoice-settings', data),
};

// ─── HR – Attendance ──────────────────────────────────────────────────────────
export const attendanceApi = {
  getAll: (api) => api.get('/attendance'),
  checkIn: (api, data) => api.post('/attendance/check-in', data),
  checkOut: (api, data) => api.post('/attendance/check-out', data),
};

// ─── HR – Vacations ───────────────────────────────────────────────────────────
export const vacationsApi = {
  getAll: (api) => api.get('/vacations'),
  create: (api, data) => api.post('/vacations', data),
  update: (api, id, data) => api.put(`/vacations/${id}`, data),
  delete: (api, id) => api.delete(`/vacations/${id}`),
};

// ─── HR – Deductions ──────────────────────────────────────────────────────────
export const deductionsApi = {
  getTypes: (api) => api.get('/deduction-types'),
  createType: (api, data) => api.post('/deduction-types', data),
  updateType: (api, id, data) => api.put(`/deduction-types/${id}`, data),
  deleteType: (api, id) => api.delete(`/deduction-types/${id}`),
  getAll: (api) => api.get('/deductions'),
  create: (api, data) => api.post('/deductions', data),
  delete: (api, id) => api.delete(`/deductions/${id}`),
};

// ─── Work Locations ───────────────────────────────────────────────────────────
export const workLocationsApi = {
  getAll: (api) => api.get('/work-locations'),
  getById: (api, id) => api.get(`/work-locations/${id}`),
  create: (api, data) => api.post('/work-locations', data),
  update: (api, id, data) => api.put(`/work-locations/${id}`, data),
  delete: (api, id) => api.delete(`/work-locations/${id}`),
};

// ─── Roles & Permissions ──────────────────────────────────────────────────────
export const rolesApi = {
  getAll: (api) => api.get('/roles'),
  getById: (api, id) => api.get(`/roles/${id}`),
  create: (api, data) => api.post('/roles', data),
  update: (api, id, data) => api.put(`/roles/${id}`, data),
  delete: (api, id) => api.delete(`/roles/${id}`),
  getPermissions: (api) => api.get('/permissions'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (api) => api.get('/notifications'),
  send: (api, data) => api.post('/notifications/send', data),
  markRead: (api, id) => api.patch(`/notifications/${id}/read`),
  markAllRead: (api) => api.patch('/notifications/read-all'),
  delete: (api, id) => api.delete(`/notifications/${id}`),
  deleteAll: (api) => api.delete('/notifications/delete-all'),
};

// ─── App Info ─────────────────────────────────────────────────────────────────
export const appInfoApi = {
  get: (api) => api.get('/app-info'),
  update: (api, data) => api.post('/app-info', data),
};

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptionsApi = {
  getAll: () => centralApi.get('/subscriptions'),
  create: (data) => centralApi.post('/subscriptions', data),
  update: (id, data) => centralApi.put(`/subscriptions/${id}`, data),
  delete: (id) => centralApi.delete(`/subscriptions/${id}`),
  getByStatus: (status) => centralApi.get(`/subscriptions/status?status=${status}`),
  activate: (id, data) => centralApi.post(`/subscriptions/${id}/activate`, data),
  cancel: (id, data) => centralApi.post(`/subscriptions/${id}/cancel`, data),
  getDetails: (id) => centralApi.get(`/subscriptions/${id}/details`),
  requestSubscription: (api, data) => api.post('/my-subscription/request', data),
  getMyStatus: (api) => api.get('/my-subscription/status'),
};

// ─── Missions ─────────────────────────────────────────────────────────────────
export const missionsApi = {
  getAll: (api, params = {}) => api.get('/missions', { params }),
};

// ─── Contact (Public Landing Page) ───────────────────────────────────────────
export const contactApi = {
  send: (data) => centralApi.post('/contact-us', data),
};
