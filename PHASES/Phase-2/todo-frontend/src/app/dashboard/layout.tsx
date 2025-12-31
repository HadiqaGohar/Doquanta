// 'use client';
// import SideNavbar from '../components/SideNavbar';
// import { useUser } from '@/features/auth/hooks';

// export default function DashboardLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     const { user, isLoading } = useUser();

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <div className="flex min-h-screen">
//             {/* Sidebar will be rendered here */}
//             <SideNavbar
//               userName={user?.name || user?.email?.split('@')[0] || 'User'}
//               userEmail={user?.email || undefined}
//             />
//             <main className="flex-1 sm:ml-10 ml-16 sm:pl-64 p-4">
//                 {children}
//             </main>
//         </div>
//     );
// }



'use client';

import { useState } from 'react';
import SideNavbar from '../components/SideNavbar';
import { useUser } from '@/features/auth/hooks';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useUser();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar with collapsed state */}
            <SideNavbar
                userName={user?.name || user?.email?.split('@')[0] || 'User'}
                userEmail={user?.email || undefined}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed} // pass state setter
            />
            
            {/* Main content */}
            <main
                className={`flex-1 transition-all duration-300 p-4`}
                style={{ marginLeft: sidebarCollapsed ? '5rem' : '16rem' }}
            >
                {children}
            </main>
        </div>
    );
}
