import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Filter, Edit2, Trash2, X, Save, Trophy, GraduationCap, CheckCircle2, AlertTriangle, Eye, Send } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';

const ResultsView = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const isTeacher = user?.role === 'teacher';
    const isTA = user?.role === 'ta';
    const isSupervisor = user?.role === 'supervisor';

    const [results, setResults] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state for Add/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentResult, setCurrentResult] = useState(null);
    const [formData, setFormData] = useState({
        student: '',
        final_score: '',
        notes: ''
    });

    useEffect(() => {
        if (isStudent) {
            fetchStudentResults();
        } else {
            fetchCourses();
            fetchStudents();
        }
    }, [isStudent]);

    useEffect(() => {
        if (selectedCourse) {
            fetchCourseResults(selectedCourse);
        } else {
            setResults([]);
        }
    }, [selectedCourse]);

    const fetchStudentResults = async () => {
        setLoading(true);
        try {
            const response = await api.get('/evaluation/results/');
            const data = response.data;
            setResults(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch student results', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const url = isSupervisor ? '/academic/courses/' : '/academic/courses/my_courses/';
            const response = await api.get(url);
            const data = response.data;
            const coursesList = Array.isArray(data) ? data : data.results || [];
            setCourses(coursesList);
            if (coursesList.length > 0) {
                setSelectedCourse(coursesList[0].id.toString());
            }
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get('/auth/users/?role=student');
            const data = response.data;
            setStudents(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch students', error);
        }
    };

    const fetchCourseResults = async (courseId) => {
        setLoading(true);
        try {
            const response = await api.get(`/evaluation/results/?course=${courseId}`);
            const data = response.data;
            setResults(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch course results', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradePoints = (grade) => {
        const points = {
            'A+': 4.00, 'A': 3.75, 'B+': 3.50, 'B': 3.00,
            'C+': 2.50, 'C': 2.00, 'D+': 1.50, 'D': 1.00, 'F': 0.00
        };
        return points[grade] || 0.00;
    };

    // Calculate student GPA
    const calculateGPA = () => {
        if (results.length === 0) return '0.00';
        const totalPoints = results.reduce((acc, curr) => acc + getGradePoints(curr.grade), 0);
        return (totalPoints / results.length).toFixed(2);
    };

    const handleOpenModal = (mode, result = null) => {
        setModalMode(mode);
        setCurrentResult(result);
        if (result) {
            setFormData({
                student: result.student,
                final_score: result.final_score,
                notes: result.notes || ''
            });
        } else {
            setFormData({
                student: students.length > 0 ? students[0].id : '',
                final_score: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            course: parseInt(selectedCourse),
            student: parseInt(formData.student),
            final_score: parseFloat(formData.final_score),
            notes: formData.notes
        };

        try {
            if (modalMode === 'add') {
                await api.post('/evaluation/results/', payload);
            } else {
                await api.patch(`/evaluation/results/${currentResult.id}/`, payload);
            }
            fetchCourseResults(selectedCourse);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save course result', error);
            alert('فشل حفظ النتيجة: ' + (error.response?.data?.detail || 'يرجى التأكد من المدخلات'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه النتيجة؟')) {
            try {
                await api.delete(`/evaluation/results/${id}/`);
                fetchCourseResults(selectedCourse);
            } catch (error) {
                console.error('Failed to delete result', error);
            }
        }
    };

    const handlePublish = async (id) => {
        try {
            await api.post(`/evaluation/results/${id}/publish/`);
            fetchCourseResults(selectedCourse);
        } catch (error) {
            console.error('Failed to publish result', error);
            alert('خطأ في النشر: ' + (error.response?.data?.error || 'حدث خطأ'));
        }
    };

    const handlePublishAll = async () => {
        if (window.confirm('هل أنت متأكد من نشر جميع نتائج هذه المادة للطلاب؟')) {
            try {
                await api.post('/evaluation/results/publish_all/', { course_id: parseInt(selectedCourse) });
                fetchCourseResults(selectedCourse);
            } catch (error) {
                console.error('Failed to publish all results', error);
                alert('خطأ في النشر: ' + (error.response?.data?.error || 'حدث خطأ'));
            }
        }
    };

    const filteredResults = results.filter(res => {
        const name = res.student_name || '';
        const number = res.student_number || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               number.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getGradeBadge = (grade) => {
        const styles = {
            'A+': 'bg-green-100 text-green-800 border-green-200',
            'A': 'bg-green-100 text-green-700 border-green-200',
            'B+': 'bg-blue-100 text-blue-800 border-blue-200',
            'B': 'bg-blue-100 text-blue-700 border-blue-200',
            'C+': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'C': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'D+': 'bg-orange-100 text-orange-800 border-orange-200',
            'D': 'bg-orange-100 text-orange-700 border-orange-200',
            'F': 'bg-red-100 text-red-700 border-red-200'
        };
        return (
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm border ${styles[grade] || 'bg-gray-100'}`}>
                {grade || '-'}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isStudent ? 'نتائجي الأكاديمية' : 'رصد ونتائج الطلاب'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isStudent ? 'عرض الدرجات النهائية والتقدير العام لكل مقرر' : 'إدخال وتعديل ونشر درجات المقررات الدراسية'}
                    </p>
                </div>

                {!isStudent && !isSupervisor && (
                    <div className="flex gap-2">
                        {isTeacher && results.some(r => !r.is_published) && (
                            <button
                                onClick={handlePublishAll}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                <span>نشر جميع الدرجات</span>
                            </button>
                        )}
                        <button
                            onClick={() => handleOpenModal('add')}
                            className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>رصد درجة جديدة</span>
                        </button>
                    </div>
                )}
            </div>

            {/* GPA section for students */}
            {isStudent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg shadow-primary-900/20">
                        <p className="text-primary-100 mb-2 font-medium">المعدل التراكمي (CGPA)</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">{calculateGPA()}</span>
                            <span className="text-sm opacity-70">/ 4.00</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">المقررات المجتازة</p>
                            <p className="text-2xl font-bold text-gray-900">{results.filter(r => r.grade !== 'F').length} مقررات</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Selector and Filter for Teachers/Supervisors */}
            {!isStudent && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-72">
                        <label className="text-xs font-semibold text-gray-500 block mb-1">المادة الدراسية</label>
                        <select
                            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name_ar || course.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex-1 w-full pt-5">
                        <Search className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 mt-2" />
                        <input
                            type="text"
                            placeholder="بحث باسم الطالب أو رقمه الجامعي..."
                            className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">جاري التحميل...</div>
                ) : filteredResults.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <GraduationCap className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="font-medium">لا توجد نتائج مسجلة حالياً</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    {isStudent ? (
                                        <>
                                            <th className="px-6 py-4">المقرر</th>
                                            <th className="px-6 py-4">الرمز</th>
                                            <th className="px-6 py-4">الدرجة النهائية</th>
                                            <th className="px-6 py-4">التقدير</th>
                                            <th className="px-6 py-4">النقاط</th>
                                            <th className="px-6 py-4">تاريخ النشر</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4">الطالب</th>
                                            <th className="px-6 py-4">الرقم الجامعي</th>
                                            <th className="px-6 py-4">الدرجة النهائية</th>
                                            <th className="px-6 py-4">التقدير</th>
                                            <th className="px-6 py-4">الحالة</th>
                                            <th className="px-6 py-4">الإجراءات</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredResults.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                        {isStudent ? (
                                            <>
                                                <td className="px-6 py-4 font-bold text-gray-900">{result.course_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500" dir="ltr">{result.course_code}</td>
                                                <td className="px-6 py-4 font-bold text-gray-700">{result.final_score}</td>
                                                <td className="px-6 py-4">{getGradeBadge(result.grade)}</td>
                                                <td className="px-6 py-4 font-medium text-gray-600">{getGradePoints(result.grade).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-xs text-gray-400">
                                                    {result.published_at ? new Date(result.published_at).toLocaleDateString('ar-EG') : '-'}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{result.student_name}</p>
                                                        <p className="text-xs text-gray-400">{result.notes}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{result.student_number}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{result.final_score}</td>
                                                <td className="px-6 py-4">{getGradeBadge(result.grade)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        result.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {result.is_published ? 'منشور' : 'مسودة'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {!isSupervisor && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleOpenModal('edit', result)}
                                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(result.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {isTeacher && !result.is_published && (
                                                            <button
                                                                onClick={() => handlePublish(result.id)}
                                                                title="نشر الدرجة"
                                                                className="px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition-colors flex items-center gap-1"
                                                            >
                                                                <Send className="w-3 h-3" />
                                                                <span>نشر</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">
                                {modalMode === 'add' ? 'رصد درجة طالب جديدة' : 'تعديل درجة الطالب'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {modalMode === 'add' ? (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">الطالب *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.student}
                                        onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                    >
                                        <option value="">اختر طالباً...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.full_name_ar} ({s.university_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 block">الطالب</label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-gray-500 border-gray-200"
                                        value={currentResult?.student_name || ''}
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">الدرجة النهائية (من 100) *</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.final_score}
                                    onChange={(e) => setFormData({ ...formData, final_score: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">ملاحظات</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="ملاحظات حول أداء الطالب أو الدرجة..."
                                />
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
                                    <span>رصد الدرجة</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsView;
