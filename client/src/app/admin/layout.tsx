import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* 
        lg: offset by sidebar width (w-64 = 16rem)
        mobile: offset by top hamburger bar height (~52px = pt-14)
      */}
      <div className="flex-1 lg:ml-64">
        <main className="min-h-screen pt-14 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
