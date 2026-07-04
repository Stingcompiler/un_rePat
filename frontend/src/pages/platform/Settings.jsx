import React, { useState } from 'react';
import { User, Lock, Save, Bell, CheckCircle2, XCircle, Building2, Calendar, Award, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirm) {
            showMessage('error', 'كلمتا المرور الجديدتان غير متطابقتين');
            return;
        }
        if (passwordData.new_password.length < 8) {
            showMessage('error', 'يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/change-password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
                new_password_confirm: passwordData.new_password_confirm,
            });
            showMessage('success', 'تم تغيير كلمة المرور بنجاح');
            setPasswordData({ old_password: '', new_password: '', new_password_confirm: '' });
        } catch (error) {
            const errData = error.response?.data || {};
            const text = errData.old_password
                || errData.new_password
                || errData.non_field_errors
                || errData.detail
                || 'حدث خطأ أثناء تغيير كلمة المرور';
            showMessage('error', Array.isArray(text) ? text[0] : text);
        } finally {
            setLoading(false);
        }
    };

    const getRoleInfo = (role) => {
        const map = {
            student: { label: 'طالب', color: 'bg-blue-100 text-blue-700', icon: '🎓' },
            teacher: { label: 'أستاذ المادة', color: 'bg-green-100 text-green-700', icon: '📚' },
            ta: { label: 'معيد / مساعد تدريس', color: 'bg-teal-100 text-teal-700', icon: '📝' },
            supervisor: { label: 'مشرف القسم', color: 'bg-purple-100 text-purple-700', icon: '🏛️' },
            system_manager: { label: 'مدير النظام', color: 'bg-red-100 text-red-700', icon: '⚙️' },
        };
        return map[role] || { label: role, color: 'bg-gray-100 text-gray-700', icon: '👤' };
    };

    const roleInfo = getRoleInfo(user?.role);

    const tabs = [
        { id: 'profile', label: 'الملف الشخصي', icon: User },
        { id: 'security', label: 'الأمان', icon: Lock },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
                <p className="text-gray-500 text-sm">عرض بيانات حسابك وتغيير كلمة المرور</p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-200 border ${
                    message.type === 'success'
                        ? 'bg-green-50 text-green-800 border-green-100'
                        : 'bg-red-50 text-red-800 border-red-100'
                }`}>
                    {message.type === 'success'
                        ? <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
                        : <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                    }
                    <span className="font-medium text-sm flex-1">{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="text-sm opacity-50 hover:opacity-100 font-bold">✕</button>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[520px]">
                {/* Sidebar Nav */}
                <div className="w-full md:w-60 bg-gray-50 border-l border-gray-100 p-4 flex flex-col gap-1 shrink-0">
                    {/* Avatar */}
                    <div className="flex flex-col items-center py-6 mb-2 border-b border-gray-100">
                        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center font-bold text-3xl border-4 border-primary-100 mb-3">
                            {user?.full_name_ar ? user.full_name_ar.charAt(0) : '?'}
                        </div>
                        <p className="font-bold text-gray-900 text-sm text-center">{user?.full_name_ar}</p>
                        <p className="text-xs text-gray-400 mb-2" dir="ltr">{user?.username}</p>
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${roleInfo.color}`}>
                            {roleInfo.icon} {roleInfo.label}
                        </span>
                    </div>

                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-8">
                    {activeTab === 'profile' && (
                        <div className="max-w-xl space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">المعلومات الشخصية</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">الاسم بالعربية</label>
                                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold text-sm">
                                        {user?.full_name_ar || '-'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">الاسم بالإنجليزية</label>
                                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold text-sm" dir="ltr">
                                        {user?.full_name_en || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5" /> البريد الإلكتروني
                                    </label>
                                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold text-sm" dir="ltr">
                                        {user?.email || '-'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" /> رقم الهاتف
                                    </label>
                                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold text-sm">
                                        {user?.phone || '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info (conditionally shown) */}
                            {(user?.department_name || user?.academic_year || user?.university_number) && (
                                <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                                    <h4 className="text-sm font-bold text-gray-700">المعلومات الأكاديمية</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {user?.department_name && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                                    <Building2 className="w-3.5 h-3.5" /> القسم
                                                </label>
                                                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold text-sm">
                                                    {user.department_name}
                                                </div>
                                            </div>
                                        )}
                                        {user?.academic_year && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" /> السنة الأكاديمية
                                                </label>
                                                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold text-sm">
                                                    السنة {user.academic_year}
                                                </div>
                                            </div>
                                        )}
                                        {user?.university_number && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                                    <Award className="w-3.5 h-3.5" /> الرقم الجامعي
                                                </label>
                                                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold text-sm" dir="ltr">
                                                    {user.university_number}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 flex gap-2 items-start">
                                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                                <span>لتعديل بياناتك الشخصية مثل الاسم أو القسم، يرجى التواصل مع مدير النظام أو مشرف القسم.</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-md animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">تغيير كلمة المرور</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">كلمة المرور الحالية *</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 text-sm"
                                        value={passwordData.old_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                        placeholder="أدخل كلمة المرور الحالية"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">كلمة المرور الجديدة *</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 text-sm"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        placeholder="8 أحرف على الأقل"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">تأكيد كلمة المرور الجديدة *</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 text-sm"
                                        value={passwordData.new_password_confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
                                        placeholder="أعد كتابة كلمة المرور الجديدة"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
