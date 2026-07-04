import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, Key, Shield, GraduationCap, X, Save, UserCheck, CheckCircle2 } from 'lucide-react';
import api from '@/api/axios';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'student', 'teacher', 'ta', 'supervisor', 'system_manager'
    
    // User CRUD Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name_ar: '',
        full_name_en: '',
        role: 'student',
        phone: '',
        university_number: '',
        department: '',
        academic_year: '',
        is_active: true
    });

    // Password Reset Modal
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetTargetUser, setResetTargetUser] = useState(null);
    const [resetPassword, setResetPassword] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users/');
            const data = response.data;
            setUsers(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/academic/departments/');
            const data = response.data.results || response.data || [];
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments', error);
        }
    };

    const handleOpenModal = (mode, userItem = null) => {
        setModalMode(mode);
        setCurrentUser(userItem);
        if (userItem) {
            setFormData({
                username: userItem.username,
                email: userItem.email || '',
                password: '', // Leave blank in edit mode
                full_name_ar: userItem.full_name_ar,
                full_name_en: userItem.full_name_en,
                role: userItem.role,
                phone: userItem.phone || '',
                university_number: userItem.university_number || '',
                department: userItem.department ? userItem.department.toString() : '',
                academic_year: userItem.academic_year ? userItem.academic_year.toString() : '',
                is_active: userItem.is_active !== undefined ? userItem.is_active : true
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                full_name_ar: '',
                full_name_en: '',
                role: 'student',
                phone: '',
                university_number: '',
                department: departments.length > 0 ? departments[0].id.toString() : '',
                academic_year: '1',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.university_number) payload.university_number = null;
            if (!payload.password) delete payload.password;
            
            // Convert foreign keys and integers
            if (payload.department) {
                payload.department = parseInt(payload.department);
            } else {
                payload.department = null;
            }

            if (payload.academic_year) {
                payload.academic_year = parseInt(payload.academic_year);
            } else {
                payload.academic_year = null;
            }

            if (modalMode === 'add') {
                await api.post('/auth/users/', payload);
            } else {
                await api.patch(`/auth/users/${currentUser.id}/`, payload);
            }
            fetchUsers();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save user', error);
            const detail = error.response?.data?.detail
                || Object.entries(error.response?.data || {})
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(', ')
                || 'حدث خطأ أثناء حفظ البيانات';
            alert(`فشل الحفظ: ${detail}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            try {
                await api.delete(`/auth/users/${id}/`);
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user', error);
            }
        }
    };

    // --- Password Reset ---
    const handleOpenResetModal = (userItem) => {
        setResetTargetUser(userItem);
        setResetPassword('');
        setIsResetModalOpen(true);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetPassword) {
            alert('الرجاء إدخال كلمة مرور جديدة');
            return;
        }

        try {
            await api.patch(`/auth/users/${resetTargetUser.id}/`, {
                password: resetPassword
            });
            alert('تم تغيير كلمة المرور للمستخدم بنجاح');
            setIsResetModalOpen(false);
        } catch (error) {
            console.error('Failed to reset password', error);
            alert('فشل تغيير كلمة المرور: ' + (error.response?.data?.detail || 'يرجى مراجعة قيود الأمان'));
        }
    };

    const filteredUsers = users.filter(userItem => {
        const matchesSearch = 
            userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userItem.full_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (userItem.email && userItem.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (userItem.university_number && userItem.university_number.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = activeTab === 'all' || userItem.role === activeTab;

        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        const styles = {
            student: 'bg-blue-100 text-blue-700',
            teacher: 'bg-green-100 text-green-700',
            ta: 'bg-teal-100 text-teal-700',
            supervisor: 'bg-purple-100 text-purple-700',
            system_manager: 'bg-red-100 text-red-700'
        };
        const labels = {
            student: 'طالب',
            teacher: 'أستاذ',
            ta: 'معيد',
            supervisor: 'مشرف',
            system_manager: 'مدير نظام'
        };
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${styles[role] || 'bg-gray-100'}`}>
                {labels[role] || role}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
                    <p className="text-gray-500 text-sm">إدارة حسابات المستخدمين وصلاحياتهم وتعيين أقسامهم الأكاديمية</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>إضافة مستخدم جديد</span>
                </button>
            </div>

            {/* Role Filtering Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-2">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'all' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    الكل ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab('student')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'student' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    الطلاب ({users.filter(u => u.role === 'student').length})
                </button>
                <button
                    onClick={() => setActiveTab('teacher')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'teacher' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    الأساتذة ({users.filter(u => u.role === 'teacher').length})
                </button>
                <button
                    onClick={() => setActiveTab('ta')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'ta' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    المعيدون ({users.filter(u => u.role === 'ta').length})
                </button>
                <button
                    onClick={() => setActiveTab('supervisor')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'supervisor' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    المشرفون ({users.filter(u => u.role === 'supervisor').length})
                </button>
                <button
                    onClick={() => setActiveTab('system_manager')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'system_manager' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    مدراء النظام ({users.filter(u => u.role === 'system_manager').length})
                </button>
            </div>

            {/* Filter Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، اسم المستخدم، البريد أو الرقم الجامعي..."
                        className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <User className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="font-medium">لا توجد حسابات للمرشح المحدد</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right animate-in fade-in duration-200">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">اسم المستخدم / الاسم الكامل</th>
                                    <th className="px-6 py-4 hidden md:table-cell">البريد والاتصال</th>
                                    <th className="px-6 py-4">الدور</th>
                                    <th className="px-6 py-4 hidden lg:table-cell">القسم الأكاديمي</th>
                                    <th className="px-6 py-4 hidden lg:table-cell">الرقم الجامعي / السنة</th>
                                    <th className="px-6 py-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((userItem) => (
                                    <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold shrink-0">
                                                    {(userItem.full_name_ar || userItem.username || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{userItem.full_name_ar || userItem.username}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{userItem.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-700">
                                            <div className="font-semibold text-gray-800">{userItem.email || '-'}</div>
                                            <div className="text-gray-400 text-xs">{userItem.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(userItem.role)}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-sm font-semibold text-gray-700">
                                            {userItem.department_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-600">
                                            <div className="font-bold">{userItem.university_number || '-'}</div>
                                            {userItem.academic_year && <div className="text-xs text-gray-400">السنة {userItem.academic_year}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenResetModal(userItem)}
                                                    title="إعادة تعيين كلمة المرور"
                                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-gray-100"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal('edit', userItem)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(userItem.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">
                                {modalMode === 'add' ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">اسم المستخدم (للدخول) *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">نوع الحساب / الصلاحية *</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 font-semibold text-sm"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="student">طالب</option>
                                        <option value="teacher">أستاذ</option>
                                        <option value="ta">معيد / مساعد تدريس</option>
                                        <option value="supervisor">مشرف قسم</option>
                                        <option value="system_manager">مدير نظام</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">الاسم الكامل (عربي) *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.full_name_ar}
                                        onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">الاسم الكامل (English) *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.full_name_en}
                                        onChange={(e) => setFormData({ ...formData, full_name_en: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0912345678"
                                    />
                                </div>
                            </div>

                            {['student', 'teacher', 'ta', 'supervisor'].includes(formData.role) && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">القسم الأكاديمي</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">لا يوجد قسم...</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name_ar || dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {formData.role === 'student' ? (
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">السنة الأكاديمية</label>
                                            <select
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                                value={formData.academic_year}
                                                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                            >
                                                <option value="1">السنة الأولى</option>
                                                <option value="2">السنة الثانية</option>
                                                <option value="3">السنة الثالثة</option>
                                                <option value="4">السنة الرابعة</option>
                                                <option value="5">السنة الخامسة</option>
                                            </select>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {formData.role === 'student' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">الرقم الجامعي</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.university_number}
                                        onChange={(e) => setFormData({ ...formData, university_number: e.target.value })}
                                        placeholder="مثال: 21812345"
                                    />
                                </div>
                            )}

                            {modalMode === 'add' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">كلمة المرور *</label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active_checkbox"
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active_checkbox" className="text-sm text-gray-700 font-medium">الحساب نشط ويمكنه تسجيل الدخول</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>حفظ المستخدم</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {isResetModalOpen && resetTargetUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">إعادة تعيين كلمة المرور</h3>
                                <p className="text-xs text-gray-500">للمستخدم: {resetTargetUser.full_name_ar || resetTargetUser.username}</p>
                            </div>
                            <button onClick={() => setIsResetModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">كلمة المرور الجديدة *</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={resetPassword}
                                    onChange={(e) => setResetPassword(e.target.value)}
                                    placeholder="اكتب كلمة المرور الجديدة..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsResetModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>حفظ وتحديث</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagement;
