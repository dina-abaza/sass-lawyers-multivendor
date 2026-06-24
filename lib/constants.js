// ─── Query Keys ───────────────────────────────────────────────────────────────
// مصدر واحد لكل query keys — يضمن عمل cache invalidation بشكل صحيح
export const QUERY_KEYS = {
  // Customers
  CUSTOMERS: 'customers',
  // Cases
  CASES: 'cases',
  CASE_STATUSES: 'case-statuses',
  LAWYERS: 'lawyers',
  // Sessions
  SESSIONS: 'sessions',
  // Consultations
  CONSULTATIONS: 'consultations',
  // Contracts
  CONTRACTS: 'contracts',
  // Employees
  EMPLOYEES: 'employees',
  DEPARTMENTS: 'departments',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  // Tasks
  TASKS: 'tasks',
  TASKS_ARCHIVE: 'tasks-archive',
  // HR
  VACATIONS: 'vacations',
  ATTENDANCE: 'attendance',
  DEDUCTIONS: 'deductions',
  DEDUCTION_TYPES: 'deduction-types',
  MISSIONS: 'missions',
  WORK_LOCATIONS: 'work-locations',
  // Finance
  INVOICES: 'invoices',
  CONSULTING_INVOICES: 'consulting-invoices',
  CONTRACT_INVOICES: 'contract-invoices',
  RECEIPTS: 'receipts',
  PAYMENT_VOUCHERS: 'payment-vouchers',
  SALARY_SHEETS: 'salary-sheets',
  ACCOUNTS: 'accounts',
  JOURNAL_ENTRIES: 'journal-entries',
  // Documents
  DOCUMENTS_LEGAL: 'documents-legal',
  DOCUMENTS_GENERAL: 'documents-general',
  // Others
  WAKALAS: 'wakalas',
  NOTIFICATIONS: 'notifications',
  SUBSCRIPTION_PLANS: 'subscription-plans',
  APP_INFO: 'app-info',
  INVOICE_SETTINGS: 'invoice-settings',
  REPORTS_LAWYER: 'reports-lawyer',
};

// ─── Shared Option Arrays ──────────────────────────────────────────────────────
export const GENDER_OPTIONS = [
  { value: 'male',   label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
];

export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'individual', label: 'فرد' },
  { value: 'company',    label: 'شركة' },
];

export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'active',     label: 'نشط' },
  { value: 'not_active', label: 'غير نشط' },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash',   label: 'نقداً' },
  { value: 'bank',   label: 'تحويل بنكي' },
  { value: 'wallet', label: 'محفظة إلكترونية' },
];

export const TASK_TYPE_OPTIONS = [
  { value: 'internal', label: 'داخلية' },
  { value: 'external', label: 'خارجية' },
];

export const TASK_STATUS_OPTIONS = [
  { value: 'active',    label: 'نشطة' },
  { value: 'completed', label: 'مكتملة' },
  { value: 'archived',  label: 'مؤرشفة' },
];

export const CONSULTATION_TYPE_OPTIONS = [
  { value: 'oral',    label: 'شفهية' },
  { value: 'written', label: 'مكتوبة' },
];

export const CONSULTATION_CLASSIFICATION_OPTIONS = [
  { value: 'commercial',    label: 'تجارية' },
  { value: 'civil',         label: 'مدنية' },
  { value: 'criminal',      label: 'جنائية' },
  { value: 'family',        label: 'أسرة' },
  { value: 'labor',         label: 'عمالية' },
  { value: 'environmental', label: 'بيئية' },
  { value: 'investment',    label: 'استثمارية' },
  { value: 'international', label: 'دولية' },
];

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'contract', label: 'عقد' },
  { value: 'letter',   label: 'خطاب' },
  { value: 'report',   label: 'تقرير' },
  { value: 'other',    label: 'أخرى' },
];

export const LEGAL_DOC_TYPE_OPTIONS = [
  { value: 'general_agency',  label: 'وكالة عامة' },
  { value: 'special_agency',  label: 'وكالة خاصة' },
  { value: 'periodic_agency', label: 'وكالة دورية - عدلية' },
  { value: 'declaration',     label: 'إقرار' },
  { value: 'debt_settlement', label: 'سداد دين' },
  { value: 'legal_pledge',    label: 'تعهد عدلي' },
  { value: 'ownership_deed',  label: 'صك ملكية' },
  { value: 'other',           label: 'أخرى' },
];
