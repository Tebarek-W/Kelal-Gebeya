import Sidebar from '@/components/DashboardSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 p-8 bg-gray-50 dark:bg-black">
                {children}
            </div>
        </div>
    )
}
