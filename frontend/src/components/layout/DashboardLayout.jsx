import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    FileText,
    User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Define menu items based on role
    const getMenuItems = () => {
        const common = [
            { name: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard },
        ];

        if (user?.role === 'student') {
            return [
                ...common,
                { name: 'مقرراتي', path: '/dashboard/courses', icon: BookOpen },
                { name: 'المحاضرات', path: '/dashboard/lectures', icon: BookOpen },
                { name: 'الواجبات', path: '/dashboard/assignments', icon: FileText },
                { name: 'النتائج', path: '/dashboard/results', icon: GraduationCap },
                { name: 'الملف الشخصي', path: '/dashboard/profile', icon: User },
            ];
        } else if (['teacher', 'ta', 'supervisor'].includes(user?.role)) {
            return [
                ...common,
                { name: 'المقررات', path: '/dashboard/courses', icon: BookOpen },
                { name: 'المحاضرات', path: '/dashboard/lectures', icon: BookOpen },
                { name: 'الواجبات والحلول', path: '/dashboard/content', icon: FileText },
                { name: 'رصد الدرجات', path: '/dashboard/grades', icon: GraduationCap },
                { name: 'الملف الشخصي', path: '/dashboard/profile', icon: User },
            ];
        } else if (user?.role === 'system_manager') {
            return [
                ...common,
                { name: 'إدارة الأقسام', path: '/dashboard/departments', icon: LayoutDashboard },
                { name: 'إدارة المستخدمين', path: '/dashboard/users', icon: Users },
                { name: 'الإعدادات', path: '/dashboard/settings', icon: Settings },
                { name: 'الملف الشخصي', path: '/dashboard/profile', icon: User },
            ];
        }
        return common;
    };

    const menuItems = getMenuItems();

    return (
        <div className="min-h-screen bg-gray-100 flex" dir="rtl">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 right-0 z-50 h-screen w-72 bg-white shadow-xl transition-transform duration-300 transform lg:translate-x-0 lg:static",
                    sidebarOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-100">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            EC
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 leading-tight">البوابة الأكاديمية</h1>
                            <p className="text-xs text-primary-600">لوحة تحكم {user?.role_display}</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                    location.pathname === item.path
                                        ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-primary-600" : "text-gray-400")} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="border-t border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.username}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 hidden sm:block">
                            {menuItems.find(i => i.path === location.pathname)?.name || 'لوحة التحكم'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="بحث..."
                                className="h-10 w-64 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                            />
                        </div>
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
