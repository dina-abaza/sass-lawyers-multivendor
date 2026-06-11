'use client';

export default function Header({ title }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
