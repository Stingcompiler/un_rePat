import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Filter, Edit2, Trash2, X, Save, FileText, Upload, CheckCircle } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';

const LecturesManagement = () => {
    const { user } = useAuth();
    const [lectures, setLectures] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentLecture, setCurrentLecture] = useState(null);
    const [fileInput, setFileInput] = useState(null);
    
    const [formData, setFormData] = useState({
        course: '',
        title_ar: '',
        title_en: '',
        content: '',
        lecture_type: 'theory',
        order: 1,
        is_published: false
    });

    useEffect(() => {
        fetchLectures();
        if (['teacher', 'ta', 'supervisor'].includes(user.role)) {
            fetchMyCourses();
        }
    }, [user.role]);

    const fetchMyCourses = async () => {
        try {
            const url = user.role === 'supervisor' ? '/academic/courses/' : '/academic/courses/my_courses/';
            const response = await api.get(url);
            const data = response.data;
            setCourses(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchLectures = async () => {
        setLoading(true);
        try {
            const response = await api.get('/content/lectures/');
            const data = response.data;
            setLectures(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch lectures', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, lecture = null) => {
        setModalMode(mode);
        setCurrentLecture(lecture);
        setFileInput(null);
        if (lecture) {
            setFormData({
                course: lecture.course,
                title_ar: lecture.title_ar,
                title_en: lecture.title_en || '',
                content: lecture.content,
                lecture_type: lecture.lecture_type,
                order: lecture.order || 1,
                is_published: lecture.is_published || false
            });
        } else {
            setFormData({
                course: courses.length > 0 ? courses[0].id : '',
                title_ar: '',
                title_en: '',
                content: '',
                lecture_type: user.role === 'ta' ? 'lab' : 'theory',
                order: 1,
                is_published: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare multi-part form data since we might have a file upload
        const data = new FormData();
        data.append('course', formData.course);
        data.append('title_ar', formData.title_ar);
        data.append('title_en', formData.title_en);
        data.append('content', formData.content);
        data.append('lecture_type', formData.lecture_type);
        data.append('order', formData.order);
        data.append('is_published', formData.is_published);
        if (fileInput) {
            data.append('file', fileInput);
        }

        try {
            if (modalMode === 'add') {
                await api.post('/content/lectures/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.patch(`/content/lectures/${currentLecture.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchLectures();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save lecture', error);
            const errorData = error.response?.data;
            let errorMessage = 'حدث خطأ أثناء حفظ المحاضرة';
            if (errorData) {
                errorMessage = Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('\n');
            }
            alert(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المحاضرة؟')) {
            try {
                await api.delete(`/content/lectures/${id}/`);
                fetchLectures();
            } catch (error) {
                console.error('Failed to delete lecture', error);
            }
        }
    };

    const filteredLectures = lectures.filter(lecture => {
        const matchesSearch = lecture.title_ar?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              lecture.title_en?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourseFilter ? lecture.course === parseInt(selectedCourseFilter) : true;
        return matchesSearch && matchesCourse;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {user.role === 'student' ? 'المحاضرات والمحتوى الدراسي' : 'إدارة المحاضرات'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {user.role === 'student' ? 'عرض المحاضرات والملفات المرفقة لمقرراتك' : 'إضافة وتعديل ونشر المحاضرات الأكاديمية'}
                    </p>
                </div>
                {['teacher', 'ta'].includes(user.role) && (
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة محاضرة</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="بحث في المحاضرات..."
                        className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {['teacher', 'ta', 'supervisor'].includes(user.role) && (
                    <div className="w-full sm:w-64">
                        <select
                            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                            value={selectedCourseFilter}
                            onChange={(e) => setSelectedCourseFilter(e.target.value)}
                        >
                            <option value="">جميع المقررات...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name_ar || course.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">جاري التحميل...</div>
            ) : filteredLectures.length === 0 ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <BookOpen className="w-12 h-12 mb-4 text-gray-300" />
                    <p>لا توجد محاضرات مضافة</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLectures.map((lecture) => (
                        <div key={lecture.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${lecture.lecture_type === 'theory' ? 'bg-blue-500' : 'bg-teal-500'}`}></div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                                    lecture.lecture_type === 'theory' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-teal-50 text-teal-700 border-teal-100'
                                }`}>
                                    {lecture.lecture_type === 'theory' ? 'نظري' : 'عملي'}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                    {['teacher', 'ta'].includes(user.role) && (
                                        <>
                                            <button
                                                onClick={() => handleOpenModal('edit', lecture)}
                                                className="p-1 text-gray-400 hover:text-primary-600 rounded-lg"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lecture.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    <span className="text-xs text-gray-500 font-bold">الترتيب: {lecture.order}</span>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                {lecture.title_ar}
                            </h3>
                            {lecture.title_en && (
                                <p className="text-sm text-gray-400 mb-2 font-medium" dir="ltr">{lecture.title_en}</p>
                            )}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                                {lecture.content}
                            </p>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    {lecture.file ? (
                                        <a
                                            href={lecture.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 text-xs font-bold hover:underline flex items-center gap-1"
                                        >
                                            <FileText className="w-4 h-4" />
                                            تحميل المرفق
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-400">لا يوجد ملف مرفق</span>
                                    )}
                                </div>

                                {['teacher', 'ta'].includes(user.role) && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        lecture.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {lecture.is_published ? 'منشور' : 'مسودة'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">
                                {modalMode === 'add' ? 'إضافة محاضرة جديدة' : 'تعديل المحاضرة'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">المقرر *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                >
                                    <option value="">اختر المقرر...</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name_ar || course.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">عنوان المحاضرة (عربي) *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.title_ar}
                                        onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">عنوان المحاضرة (English)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.title_en}
                                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">المحتوى / الوصف *</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">الترتيب في المساق</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">نوع المحاضرة</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 font-medium"
                                        value={formData.lecture_type}
                                        onChange={(e) => setFormData({ ...formData, lecture_type: e.target.value })}
                                        disabled={user.role === 'teacher' || user.role === 'ta'}
                                    >
                                        <option value="theory">نظري (Theory)</option>
                                        <option value="lab">عملي (Lab)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">ملف مرفق (PDF / عرض تقديمى / الخ)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                                <span>اختر ملفاً</span>
                                                <input 
                                                    id="file-upload" 
                                                    name="file-upload" 
                                                    type="file" 
                                                    className="sr-only"
                                                    onChange={(e) => setFileInput(e.target.files[0])} 
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {fileInput ? `الملف المختار: ${fileInput.name}` : 'PDF, DOC, PPT, ZIP حتى 10 ميجا'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                />
                                <label htmlFor="is_published" className="text-sm text-gray-700">نشر المحاضرة فوراً للطلاب</label>
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
        </div>
    );
};

export default LecturesManagement;
