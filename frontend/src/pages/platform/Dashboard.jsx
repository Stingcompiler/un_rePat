import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
import { BookOpen, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/academic/dashboard_stats/');
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-3xl p-8 text-white shadow-xl shadow-primary-900/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-10 -mt-10"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">مرحباً، {user?.first_name || user?.full_name_ar} 👋</h1>
                    <p className="text-primary-200">نتمنى لك يوماً دراسياً موفقاً! إليك ملخص نشاطك اليوم.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {user?.role === 'student' && (
                    <>
                        <StatCard title="المواد المسجلة" value={stats?.courses_count || 0} icon={BookOpen} color="bg-blue-500" />
                        <StatCard title="الواجبات القادمة" value={stats?.upcoming_assignments || 0} icon={Clock} color="bg-amber-500" />
                        <StatCard title="الواجبات المسلمة" value={stats?.submitted_count || 0} icon={CheckCircle} color="bg-emerald-500" />
                        <StatCard title="التنبيهات" value={stats?.alerts_count || 0} icon={AlertCircle} color="bg-rose-500" />
                    </>
                )}

                {(user?.role === 'teacher' || user?.role === 'ta') && (
                    <>
                        <StatCard title="المواد النشطة" value={stats?.active_courses || 0} icon={BookOpen} color="bg-blue-500" />
                        <StatCard title="عدد الطلاب" value={stats?.total_students || 0} icon={BookOpen} color="bg-indigo-500" />
                        <StatCard title="واجبات للتصحيح" value={stats?.ungraded_count || 0} icon={Clock} color="bg-amber-500" />
                        <StatCard title="محاضراتي" value={stats?.lectures_count || 0} icon={CheckCircle} color="bg-emerald-500" />
                    </>
                )}

                {user?.role === 'supervisor' && (
                    <>
                        <StatCard title="المواد النشطة" value={stats?.active_courses || 0} icon={BookOpen} color="bg-blue-500" />
                        <StatCard title="عدد الطلاب" value={stats?.total_students || 0} icon={BookOpen} color="bg-indigo-500" />
                        <StatCard title="الواجبات المنشأة" value={stats?.created_assignments || 0} icon={Clock} color="bg-amber-500" />
                        <StatCard title="المدرسين" value={stats?.total_instructors || 0} icon={CheckCircle} color="bg-emerald-500" />
                    </>
                )}

                {user?.role === 'system_manager' && (
                    <>
                        <StatCard title="المواد النشطة" value={stats?.active_courses || 0} icon={BookOpen} color="bg-blue-500" />
                        <StatCard title="عدد الطلاب" value={stats?.total_students || 0} icon={BookOpen} color="bg-indigo-500" />
                        <StatCard title="الأقسام" value={stats?.total_departments || 0} icon={Clock} color="bg-amber-500" />
                        <StatCard title="المستخدمين" value={stats?.total_users || 0} icon={CheckCircle} color="bg-emerald-500" />
                    </>
                )}
            </div>

            {/* Recent Activity / Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            {user?.role === 'student' ? 'الجدول الدراسي اليوم' : 'المحاضرات القادمة'}
                        </h3>
                        <button className="text-primary-600 text-sm font-bold hover:bg-primary-50 px-3 py-1 rounded-lg transition-colors">
                            عرض الكل
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Clock className="w-12 h-12 mb-3 opacity-20" />
                        <p>لا توجد محاضرات مجدولة لهذا اليوم</p>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Notices */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">الإعلانات</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                <h4 className="font-bold text-yellow-800 text-sm mb-1">تسجيل المواد</h4>
                                <p className="text-yellow-700 text-xs">آخر موعد لتسجيل المواد هو نهاية الأسبوع الحالي.</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-800 text-sm mb-1">عطلة رسمية</h4>
                                <p className="text-blue-700 text-xs">تعطل الدراسة يوم الأحد القادم بمناسبة...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
