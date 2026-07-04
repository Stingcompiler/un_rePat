import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, X, Save, UserCheck, ShieldAlert } from 'lucide-react';
import api from '@/api/axios';

const DepartmentsManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Department CRUD Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentDept, setCurrentDept] = useState(null);
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        is_active: true
    });

    // Supervisor Assignment Modal
    const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
    const [supervisors, setSupervisors] = useState([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState('');
    const [activeDept, setActiveDept] = useState(null);

    useEffect(() => {
        fetchDepartments();
        fetchSupervisors();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/academic/departments/');
            const data = response.data;
            setDepartments(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch departments', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSupervisors = async () => {
        try {
            const response = await api.get('/auth/users/?role=supervisor');
            const data = response.data;
            setSupervisors(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch supervisors', error);
        }
    };

    const handleOpenModal = (mode, dept = null) => {
        setModalMode(mode);
        setCurrentDept(dept);
        if (dept) {
            setFormData({
                name_ar: dept.name_ar || dept.name || '',
                name_en: dept.name_en || '',
                description_ar: dept.description_ar || '',
                description_en: dept.description_en || '',
                is_active: dept.is_active
            });
        } else {
            setFormData({
                name_ar: '',
                name_en: '',
                description_ar: '',
                description_en: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('/academic/departments/', formData);
            } else {
                await api.patch(`/academic/departments/${currentDept.id}/`, formData);
            }
            fetchDepartments();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save department', error);
            alert('حدث خطأ أثناء حفظ القسم: ' + (error.response?.data?.detail || 'يرجى التأكد من ملء جميع الحقول المطلوبة'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
            try {
                await api.delete(`/academic/departments/${id}/`);
                fetchDepartments();
            } catch (error) {
                console.error('Failed to delete department', error);
            }
        }
    };

    // --- Supervisor Assignment ---
    const handleOpenSupervisorModal = (dept) => {
        setActiveDept(dept);
        setSelectedSupervisor(dept.supervisor ? dept.supervisor.toString() : '');
        setIsSupervisorModalOpen(true);
    };

    const handleAssignSupervisor = async (e) => {
        e.preventDefault();
        if (!selectedSupervisor) {
            alert('الرجاء تحديد مشرف');
            return;
        }

        try {
            await api.post(`/academic/departments/${activeDept.id}/assign_supervisor/`, {
                supervisor_id: parseInt(selectedSupervisor)
            });
            alert('تم تعيين المشرف بنجاح');
            setIsSupervisorModalOpen(false);
            fetchDepartments();
        } catch (error) {
            console.error('Failed to assign supervisor', error);
            alert('خطأ في التعيين: ' + (error.response?.data?.error || 'حدث خطأ غير متوقع'));
        }
    };

    const filteredDepartments = departments.filter(dept =>
        (dept.name_ar || dept.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.name_en || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الأقسام</h1>
                    <p className="text-gray-500 text-sm">إدارة الأقسام الأكاديمية وتعيين مشرفي الأقسام</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>إضافة قسم جديد</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="بحث باسم القسم الدراسي..."
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
                ) : filteredDepartments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <Building2 className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="font-medium">لا توجد أقسام مسجلة حالياً</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right animate-in fade-in duration-200">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">اسم القسم</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">المشرف</th>
                                    <th className="px-6 py-4 hidden md:table-cell">المواد المسجلة</th>
                                    <th className="px-6 py-4 hidden md:table-cell">الطلاب المقيدين</th>
                                    <th className="px-6 py-4 hidden md:table-cell">الحالة</th>
                                    <th className="px-6 py-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDepartments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-bold shrink-0">
                                                    {(dept.name_ar || dept.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{dept.name_ar || dept.name}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{dept.name_en}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell text-sm font-semibold text-gray-700">
                                            {dept.supervisor_name || (
                                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-100">
                                                    غير معين
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell text-sm font-medium text-gray-600">
                                            {dept.courses_count || 0} مواد
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell text-sm font-medium text-gray-600">
                                            {dept.students_count || 0} طلاب
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                dept.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {dept.is_active ? 'نشط' : 'موقف'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenSupervisorModal(dept)}
                                                    title="تعيين مشرف القسم"
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-100"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal('edit', dept)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dept.id)}
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

            {/* Department Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">
                                {modalMode === 'add' ? 'إضافة قسم جديد' : 'تعديل القسم'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">اسم القسم (عربي) *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">اسم القسم (English)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.name_en}
                                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">نبذة مختصرة عن القسم *</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active_checkbox"
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active_checkbox" className="text-sm text-gray-700 font-medium">القسم نشط ويقبل تسجيل المقررات</label>
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
                                    <span>حفظ البيانات</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Supervisor Assignment Modal */}
            {isSupervisorModalOpen && activeDept && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">تعيين مشرف القسم</h3>
                                <p className="text-xs text-gray-500">القسم: {activeDept.name_ar}</p>
                            </div>
                            <button onClick={() => setIsSupervisorModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAssignSupervisor} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">المشرف الأكاديمي *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 font-semibold"
                                    value={selectedSupervisor}
                                    onChange={(e) => setSelectedSupervisor(e.target.value)}
                                >
                                    <option value="">اختر مشرفاً...</option>
                                    {supervisors.map(s => (
                                        <option key={s.id} value={s.id}>{s.full_name_ar} ({s.username})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-xs leading-relaxed">
                                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                                <div>
                                    <span className="font-bold">تنبيه هام:</span>
                                    <p className="mt-1">يمكن للمشرف إدارة قسم أكاديمي واحد فقط. سيؤدي هذا الإجراء إلى تعيين المشرف المختار لإدارة هذا القسم.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsSupervisorModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                                >
                                    <UserCheck className="w-4 h-4" />
                                    <span>تعيين مشرف</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentsManagement;
