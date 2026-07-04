import React, { useState } from 'react';
import { User, Lock, Save, Phone, Mail, Building2, Calendar, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [profileData, setProfileData] = useState({
        full_name_ar: user?.full_name_ar || '',
        full_name_en: user?.full_name_en || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await api.patch('/auth/profile/', profileData);
            updateProfile(response.data);
            setMessage({ type: 'success', text: 'تم تحديث بيانات الملف الشخصي بنجاح' });
        } catch (error) {
            console.error('Failed to update profile', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.detail || 'حدث خطأ أثناء تحديث البيانات' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirm) {
            setMessage({ type: 'error', text: 'كلمتا المرور الجديدتان غير متطابقتين' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/auth/change-password/', passwordData);
            setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
            setPasswordData({ old_password: '', new_password: '', new_password_confirm: '' });
        } catch (error) {
            console.error('Failed to change password', error);
            const errDetail = error.response?.data?.old_password || 
                              error.response?.data?.non_field_errors ||
                              'حدث خطأ أثناء تغيير كلمة المرور';
            setMessage({ type: 'error', text: errDetail });
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            student: 'طالب',
            teacher: 'أستاذ',
            ta: 'معيد',
            supervisor: 'مشرف القسم',
            system_manager: 'مدير النظام'
        };
        return labels[role] || role;
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
                <p className="text-gray-500 text-sm">عرض وتعديل معلومات حسابك وإعدادات الأمان</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center justify-between animate-in fade-in duration-200 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    <span className="font-medium text-sm">{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="text-sm font-bold opacity-50 hover:opacity-100">✕</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center h-fit">
                    <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center font-bold text-3xl mb-4 border-4 border-primary-100">
                        {user?.full_name_ar ? user.full_name_ar.charAt(0) : '?'}
                    </div>
                    <h2 className="font-bold text-xl text-gray-900 mb-1">{user?.full_name_ar}</h2>
                    <p className="text-sm text-gray-500 mb-3" dir="ltr">{user?.username}</p>
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100 mb-6">
                        {getRoleLabel(user?.role)}
                    </span>

                    <div className="w-full text-right space-y-3 pt-6 border-t border-gray-100 text-sm text-gray-600">
                        {user?.department_name && (
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span>القسم: <strong>{user.department_name}</strong></span>
                            </div>
                        )}
                        {user?.academic_year && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>السنة الدراسية: <strong>{user.academic_year}</strong></span>
                            </div>
                        )}
                        {user?.university_number && (
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-gray-400" />
                                <span>الرقم الجامعي: <strong>{user.university_number}</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit forms */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Information Form */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                            <User className="w-5 h-5 text-primary-500" />
                            <span>المعلومات الشخصية</span>
                        </h3>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700">الاسم بالعربية *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={profileData.full_name_ar}
                                        onChange={(e) => setProfileData({ ...profileData, full_name_ar: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700">الاسم بالإنجليزية</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={profileData.full_name_en}
                                        onChange={(e) => setProfileData({ ...profileData, full_name_en: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        <span>البريد الإلكتروني *</span>
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        <span>رقم الهاتف</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>حفظ التغييرات</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                            <Lock className="w-5 h-5 text-primary-500" />
                            <span>تغيير كلمة المرور</span>
                        </h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700">كلمة المرور الحالية *</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={passwordData.old_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700">كلمة المرور الجديدة *</label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700">تأكيد كلمة المرور الجديدة *</label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={passwordData.new_password_confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>تغيير كلمة المرور</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
