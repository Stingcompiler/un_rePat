import React, { useState, useEffect } from 'react';
import { Plus, Search, Book, Edit2, Trash2, X, Save, Users, UserPlus, Trash, ShieldAlert } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';

const CoursesManagement = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Course modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        code: '',
        name_ar: '',
        name_en: '',
        description_ar: '',
        department: '',
        academic_year: '',
        semester: 1,
        credits: 3,
        has_lab: false
    });

    // Instructor management panel states
    const [isInstructorsModalOpen, setIsInstructorsModalOpen] = useState(false);
    const [activeCourse, setActiveCourse] = useState(null);
    const [assignedInstructors, setAssignedInstructors] = useState([]);
    const [allStaff, setAllStaff] = useState([]); // Teachers and TAs
    const [loadingInstructors, setLoadingInstructors] = useState(false);
    const [instructorForm, setInstructorForm] = useState({
        instructor: '',
        role: 'teacher'
    });

    useEffect(() => {
        fetchCourses();
        if (['system_manager', 'supervisor'].includes(user.role)) {
            fetchMetadata();
            fetchStaff();
        }
    }, [user.role]);

    const fetchMetadata = async () => {
        try {
            const deptRes = await api.get('/academic/departments/');
            const depts = deptRes.data.results || deptRes.data;
            setDepartments(depts);

            setFormData(prev => {
                const newData = { ...prev };
                if (depts.length > 0 && !prev.department) {
                    newData.department = depts[0].id;
                }
                if (!prev.academic_year) {
                    newData.academic_year = 1;
                }
                return newData;
            });
        } catch (error) {
            console.error('Failed to fetch metadata', error);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await api.get('/auth/users/');
            const usersList = response.data.results || response.data || [];
            // Filter to include only teachers and TAs
            const staff = usersList.filter(u => ['teacher', 'ta'].includes(u.role));
            setAllStaff(staff);
            if (staff.length > 0) {
                setInstructorForm(prev => ({ ...prev, instructor: staff[0].id.toString() }));
            }
        } catch (error) {
            console.error('Failed to fetch staff users', error);
        }
    };

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const url = ['teacher', 'ta'].includes(user.role) ? '/academic/courses/my_courses/' : '/academic/courses/';
            const response = await api.get(url);
            const data = response.data;
            setCourses(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, course = null) => {
        setModalMode(mode);
        setCurrentCourse(course);
        if (course) {
            setFormData({
                code: course.code,
                name_ar: course.name_ar,
                name_en: course.name_en || '',
                description_ar: course.description_ar || '',
                department: course.department,
                academic_year: course.academic_year,
                semester: course.semester || 1,
                credits: course.credits || 3,
                has_lab: course.has_lab || false
            });
        } else {
            setFormData({
                code: '',
                name_ar: '',
                name_en: '',
                description_ar: '',
                department: departments.length > 0 ? departments[0].id : '',
                academic_year: 1,
                semester: 1,
                credits: 3,
                has_lab: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            department: parseInt(formData.department),
            academic_year: parseInt(formData.academic_year),
            semester: parseInt(formData.semester),
            credits: parseInt(formData.credits),
        };

        try {
            if (modalMode === 'add') {
                await api.post('/academic/courses/', payload);
            } else {
                await api.patch(`/academic/courses/${currentCourse.id}/`, payload);
            }
            fetchCourses();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save course', error);
            alert('فشل حفظ المقرر: ' + (error.response?.data?.detail || 'يرجى مراجعة الحقول المطلوبة'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقرر؟')) {
            try {
                await api.delete(`/academic/courses/${id}/`);
                fetchCourses();
            } catch (error) {
                console.error('Failed to delete course', error);
            }
        }
    };

    // --- Course Instructor Management ---
    const handleOpenInstructorsModal = async (course) => {
        setActiveCourse(course);
        setIsInstructorsModalOpen(true);
        setLoadingInstructors(true);
        try {
            const response = await api.get(`/academic/instructors/?course=${course.id}`);
            const data = response.data;
            setAssignedInstructors(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch assigned instructors', error);
        } finally {
            setLoadingInstructors(false);
        }
    };

    const handleAssignInstructor = async (e) => {
        e.preventDefault();
        if (!instructorForm.instructor) {
            alert('الرجاء اختيار مدرس');
            return;
        }

        const payload = {
            course: activeCourse.id,
            instructor: parseInt(instructorForm.instructor),
            role: instructorForm.role
        };

        try {
            await api.post('/academic/instructors/', payload);
            // Refresh list
            handleOpenInstructorsModal(activeCourse);
        } catch (error) {
            console.error('Failed to assign instructor', error);
            alert('خطأ في التعيين: ' + (error.response?.data?.detail || 'قد يكون هذا المدرس مسجلاً في المقرر بالفعل'));
        }
    };

    const handleRemoveInstructor = async (id) => {
        if (window.confirm('هل أنت متأكد من إلغاء تعيين هذا المدرس؟')) {
            try {
                await api.delete(`/academic/instructors/${id}/`);
                handleOpenInstructorsModal(activeCourse);
            } catch (error) {
                console.error('Failed to remove instructor', error);
            }
        }
    };

    const filteredCourses = courses.filter(course =>
        (course.name_ar || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.name_en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAcademicYearLabel = (year) => {
        const labels = {
            1: 'السنة الأولى',
            2: 'السنة الثانية',
            3: 'السنة الثالثة',
            4: 'السنة الرابعة',
            5: 'السنة الخامسة'
        };
        return labels[year] || `السنة ${year}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {user.role === 'student' ? 'مقرراتي الدراسية' : 'إدارة المقررات الدراسية'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {user.role === 'student' ? 'قائمة المقررات المسجلة لك حالياً' : 'إنشاء وتعديل المقررات وإسنادها للهيئة التدريسية'}
                    </p>
                </div>
                {['system_manager', 'supervisor'].includes(user.role) && (
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة مقرر جديد</span>
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="بحث برمز أو اسم المقرر الدراسي..."
                        className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Courses Cards Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">جاري التحميل...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <Book className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="font-medium text-gray-600">لا توجد مقررات متوفرة للبحث المحدد</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-primary-100" dir="ltr">
                                        {course.code}
                                    </span>
                                    {['system_manager', 'supervisor'].includes(user.role) && (
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleOpenModal('edit', course)}
                                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-100"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 mb-1">
                                    {course.name_ar}
                                </h3>
                                {course.name_en && (
                                    <p className="text-sm text-gray-400 mb-3 font-medium" dir="ltr">{course.name_en}</p>
                                )}

                                <div className="text-sm text-gray-500 space-y-1.5 mb-6">
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        <span>القسم: <strong>{course.department_name || 'عام'}</strong></span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        <span>الفصل: <strong>المستوى {course.semester}</strong></span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        <span>المرحلة: <strong>{getAcademicYearLabel(course.academic_year)}</strong></span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        <span>الساعات: <strong>{course.credits} ساعات</strong></span>
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-sm mt-auto">
                                <div className="text-xs text-gray-400">
                                    {course.has_lab && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-100">يحتوي على معمل</span>}
                                </div>
                                {['system_manager', 'supervisor'].includes(user.role) && (
                                    <button
                                        onClick={() => handleOpenInstructorsModal(course)}
                                        className="text-primary-600 font-bold hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <Users className="w-4 h-4" />
                                        <span>المدرسون ({course.instructors_list?.length || 0})</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Course CRUD Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">
                                {modalMode === 'add' ? 'إضافة مقرر دراسي جديد' : 'تعديل بيانات المقرر'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">رمز المقرر *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="CS101"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">عدد الساعات المعتمدة *</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">اسم المقرر (عربي) *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">اسم المقرر (English)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">وصف المقرر الدراسي</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                    placeholder="اكتب نبذة مختصرة عن أهداف المقرر ومحتوياته..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">القسم الدراسي *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">اختر القسم...</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name_ar || dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">المستوى الدراسي *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>المستوى {i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">السنة الأكاديمية *</label>
                                    <select
                                        required
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
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="has_lab_checkbox"
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={formData.has_lab}
                                    onChange={(e) => setFormData({ ...formData, has_lab: e.target.checked })}
                                />
                                <label htmlFor="has_lab_checkbox" className="text-sm text-gray-700 font-medium">يحتوي المقرر على شق عملي (معمل)</label>
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
                                    <span>حفظ المقرر</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Instructor Assignment Modal */}
            {isInstructorsModalOpen && activeCourse && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">إسناد مدرسي المقرر</h3>
                                <p className="text-xs text-gray-500">المقرر: {activeCourse.name_ar} ({activeCourse.code})</p>
                            </div>
                            <button onClick={() => setIsInstructorsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Assigned Instructors List */}
                            <div>
                                <h4 className="font-bold text-sm text-gray-700 mb-3">المدرسون والمعيدون الحاليون</h4>
                                {loadingInstructors ? (
                                    <div className="text-center py-4 text-gray-500">جاري التحميل...</div>
                                ) : assignedInstructors.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-400 border border-dashed border-gray-200">
                                        لم يتم إسناد أي مدرسين أو معيدين لهذا المقرر حتى الآن.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden">
                                        {assignedInstructors.map((inst) => (
                                            <div key={inst.id} className="flex justify-between items-center p-3 bg-white hover:bg-gray-50">
                                                <div>
                                                    <span className="font-bold text-gray-900 text-sm">{inst.instructor_name}</span>
                                                    <span className={`mr-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                        inst.role === 'teacher' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                        {inst.role_display}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveInstructor(inst.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Assign New Instructor Form */}
                            <form onSubmit={handleAssignInstructor} className="border-t border-gray-100 pt-6">
                                <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-1">
                                    <UserPlus className="w-4 h-4" />
                                    <span>إسناد مدرس جديد</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-700">المدرس / المعيد</label>
                                        <select
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 font-medium text-sm"
                                            value={instructorForm.instructor}
                                            onChange={(e) => setInstructorForm({ ...instructorForm, instructor: e.target.value })}
                                        >
                                            <option value="">اختر من القائمة...</option>
                                            {allStaff.map(s => (
                                                <option key={s.id} value={s.id}>{s.full_name_ar} ({s.role_display})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-700">الدور التدريسي</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 font-medium text-sm"
                                            value={instructorForm.role}
                                            onChange={(e) => setInstructorForm({ ...instructorForm, role: e.target.value })}
                                        >
                                            <option value="teacher">أستاذ المادة (Teacher)</option>
                                            <option value="ta">معيد / مساعد تدريس (TA)</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="h-10 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>إسناد للمادة</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesManagement;
