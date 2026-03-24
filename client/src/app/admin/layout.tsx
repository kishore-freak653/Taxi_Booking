import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
