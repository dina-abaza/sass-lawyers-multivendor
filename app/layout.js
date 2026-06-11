import './globals.css';
import Providers from '@/providers/Providers';

export const metadata = {
  title: 'نظام المحاماة',
  description: 'نظام إدارة مكتب المحاماة',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
