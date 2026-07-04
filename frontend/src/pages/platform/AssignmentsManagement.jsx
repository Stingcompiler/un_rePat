import React, { useState, useEffect } from 'react';
import { FileText, Plus, Upload, CheckCircle2, Clock, X, Save, Edit2, Trash2, BookOpen, AlertCircle, FileCheck, Award, MessageSquare } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';

const AssignmentsManagement = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const isTeacher = user?.role === 'teacher';
    const isTA = user?.role === 'ta';
    const isSupervisor = user?.role === 'supervisor';

    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Assignment CRUD Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [formData, setFormData] = useState({
        title_ar: '',
        title_en: '',
        description: '',
        course: '',
        assignment_type: 'theory',
        max_score: 100,
        due_date: '',
        is_published: false
    });

    // Student submission modal
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submissionNotes, setSubmissionNotes] = useState('');

    // Teacher/TA submissions view panel
    const [isSubmissionsPanelOpen, setIsSubmissionsPanelOpen] = useState(false);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    
    // Grading states
    const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
    const [gradeScore, setGradeScore] = useState('');
    const [gradeFeedback, setGradeFeedback] = useState('');

    useEffect(() => {
        fetchAssignments();
        if (['teacher', 'ta', 'supervisor'].includes(user.role)) {
            fetchMyCourses();
        }
    }, [user.role]);

    const fetchMyCourses = async () => {
        try {
            const url = isSupervisor ? '/academic/courses/' : '/academic/courses/my_courses/';
            const response = await api.get(url);
            const data = response.data;
            setCourses(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/content/assignments/');
            const data = response.data;
            setAssignments(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch assignments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, assignment = null) => {
        setModalMode(mode);
        setCurrentAssignment(assignment);
        if (assignment) {
            setFormData({
                title_ar: assignment.title_ar,
                title_en: assignment.title_en || '',
                description: assignment.description,
                course: assignment.course,
                assignment_type: assignment.assignment_type,
                max_score: assignment.max_score,
                due_date: assignment.due_date ? assignment.due_date.substring(0, 16) : '',
                is_published: assignment.is_published || false
            });
        } else {
            setFormData({
                title_ar: '',
                title_en: '',
                description: '',
                course: courses.length > 0 ? courses[0].id : '',
                assignment_type: isTA ? 'lab' : 'theory',
                max_score: 100,
                due_date: '',
                is_published: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('/content/assignments/', formData);
            } else {
                await api.patch(`/content/assignments/${currentAssignment.id}/`, formData);
            }
            fetchAssignments();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save assignment', error);
            alert('حدث خطأ أثناء حفظ الواجب: ' + (error.response?.data?.detail || 'تأكد من صحة البيانات وصلاحية دورك'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الواجب؟')) {
            try {
                await api.delete(`/content/assignments/${id}/`);
                fetchAssignments();
            } catch (error) {
                console.error('Failed to delete assignment', error);
            }
        }
    };

    // --- Student Submission Methods ---
    const handleOpenSubmitModal = (assignment) => {
        setSelectedAssignment(assignment);
        setSubmissionFile(null);
        setSubmissionNotes('');
        setIsSubmitModalOpen(true);
    };

    const handleSubmissionSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile) {
            alert('الرجاء اختيار ملف الحل');
            return;
        }

        const data = new FormData();
        data.append('assignment', selectedAssignment.id);
        data.append('file', submissionFile);
        data.append('notes', submissionNotes);

        try {
            await api.post('/evaluation/submissions/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('تم تسليم الواجب بنجاح');
            setIsSubmitModalOpen(false);
            fetchAssignments();
        } catch (error) {
            console.error('Failed to submit solution', error);
            const errDetail = error.response?.data?.detail || 
                              (error.response?.data ? Object.values(error.response.data).join(', ') : '') ||
                              'حدث خطأ أثناء تسليم الواجب';
            alert(errDetail);
        }
    };

    // --- Teacher/TA Submissions & Grading Methods ---
    const handleOpenSubmissionsPanel = async (assignment) => {
        setActiveAssignment(assignment);
        setIsSubmissionsPanelOpen(true);
        setLoadingSubmissions(true);
        setGradingSubmissionId(null);
        try {
            const response = await api.get(`/evaluation/submissions/?assignment=${assignment.id}`);
            const data = response.data;
            setSubmissions(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch submissions', error);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleStartGrading = (sub) => {
        setGradingSubmissionId(sub.id);
        setGradeScore(sub.score !== null ? sub.score.toString() : '');
        setGradeFeedback(sub.feedback || '');
    };

    const handleSaveGrade = async (subId) => {
        if (!gradeScore || isNaN(parseFloat(gradeScore))) {
            alert('الرجاء إدخال درجة صالحة');
            return;
        }
        try {
            await api.post(`/evaluation/submissions/${subId}/grade/`, {
                score: parseFloat(gradeScore),
                feedback: gradeFeedback
            });
            alert('تم رصد درجة الواجب بنجاح');
            setGradingSubmissionId(null);
            // Refresh submissions
            handleOpenSubmissionsPanel(activeAssignment);
        } catch (error) {
            console.error('Failed to grade submission', error);
            alert(error.response?.data?.error || 'حدث خطأ أثناء رصد الدرجة');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isStudent ? 'الواجبات والمهام الدراسية' : 'إدارة الواجبات والحلول'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isStudent ? 'عرض الواجبات المطلوبة ومواعيد التسليم ورفع الحلول' : 'إنشاء وتعديل الواجبات وتصحيح حلول الطلاب ورصد درجاتها'}
                    </p>
                </div>
                {['teacher', 'ta'].includes(user.role) && (
                    <button
                        onClick={() => handleOpenModal('add')}
                        disabled={courses.length === 0}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إنشاء واجب جديد</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">جاري التحميل...</div>
            ) : assignments.length === 0 ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <FileText className="w-12 h-12 mb-4 text-gray-300" />
                    <p>لا توجد واجبات حالية</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {assignments.map((assignment) => {
                        const subStatus = assignment.submission_status || {};
                        const isSubmitted = subStatus.submitted;
                        const isGraded = subStatus.graded;
                        const scoreObtained = subStatus.score;
                        const isPastDue = new Date(assignment.due_date) < new Date();

                        return (
                            <div key={assignment.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-2 h-full ${assignment.assignment_type === 'theory' ? 'bg-primary-500' : 'bg-amber-500'}`}></div>
                                <div>
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                                                assignment.assignment_type === 'theory' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                {assignment.assignment_type === 'theory' ? 'نظري' : 'عملي'}
                                            </span>
                                        </div>
                                        {['teacher', 'ta'].includes(user.role) && (
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                                assignment.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {assignment.is_published ? 'منشور' : 'مسودة'}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                                        {assignment.title_ar}
                                    </h3>
                                    {assignment.title_en && (
                                        <p className="text-sm text-gray-400 mb-2 font-medium" dir="ltr">{assignment.title_en}</p>
                                    )}
                                    <p className="text-sm text-gray-500 mb-4">{assignment.course_name || 'عام'}</p>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                        {assignment.description}
                                    </p>

                                    {assignment.file && (
                                        <div className="mb-4">
                                            <a
                                                href={assignment.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-bold hover:underline"
                                            >
                                                <FileCheck className="w-4 h-4" />
                                                تحميل ورقة الأسئلة
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-xs pt-4 border-t border-gray-50 text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span>آخر موعد: <strong>{new Date(assignment.due_date).toLocaleString('ar-EG')}</strong></span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Award className="w-4 h-4 text-gray-400" />
                                            <span>الدرجة الكلية: <strong>{assignment.max_score}</strong></span>
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between items-center gap-4 border-t border-gray-50 pt-4">
                                    {isStudent ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                {isSubmitted ? (
                                                    <span className="text-green-600 flex items-center gap-1.5 font-bold text-sm bg-green-50 px-2.5 py-1.5 rounded-xl border border-green-100">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        {isGraded ? `تم التصحيح (${scoreObtained}/${assignment.max_score})` : 'تم تسليم الحل'}
                                                    </span>
                                                ) : isPastDue ? (
                                                    <span className="text-red-600 flex items-center gap-1 font-bold text-sm bg-red-50 px-2.5 py-1.5 rounded-xl border border-red-100">
                                                        <AlertCircle className="w-4 h-4" />
                                                        فات موعد التسليم
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 flex items-center gap-1 font-bold text-sm bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100">
                                                        <Clock className="w-4 h-4" />
                                                        مستحق التسليم
                                                    </span>
                                                )}
                                            </div>
                                            {!isSubmitted && !isPastDue && (
                                                <button
                                                    onClick={() => handleOpenSubmitModal(assignment)}
                                                    className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    <span>تسليم الحل</span>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center w-full">
                                            <button
                                                onClick={() => handleOpenSubmissionsPanel(assignment)}
                                                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl font-bold hover:bg-primary-100 transition-colors flex items-center gap-1.5 text-sm"
                                            >
                                                <FileText className="w-4 h-4" />
                                                <span>عرض تسليمات الطلاب</span>
                                            </button>
                                            
                                            {['teacher', 'ta'].includes(user.role) && (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenModal('edit', assignment)}
                                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-100"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(assignment.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Assignment CRUD Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">
                                {modalMode === 'add' ? 'إنشاء واجب جديد' : 'تعديل الواجب'}
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
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 font-medium"
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
                                    <label className="text-sm font-medium text-gray-700">عنوان الواجب (عربي) *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.title_ar}
                                        onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">عنوان الواجب (English)</label>
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
                                <label className="text-sm font-medium text-gray-700">التفاصيل والوصف *</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">موعد التسليم النهائي *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">الدرجة الكلية *</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                        value={formData.max_score}
                                        onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">نوع التقييم</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 font-medium"
                                        value={formData.assignment_type}
                                        onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
                                        disabled={user.role === 'teacher' || user.role === 'ta'}
                                    >
                                        <option value="theory">نظري</option>
                                        <option value="lab">عملي</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        />
                                        <span className="text-sm text-gray-700 font-medium">نشر للطلاب فوراً</span>
                                    </label>
                                </div>
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
                                    <span>حفظ التغييرات</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Student Submit Solution Modal */}
            {isSubmitModalOpen && selectedAssignment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">تسليم حل الواجب: {selectedAssignment.title_ar}</h3>
                            <button onClick={() => setIsSubmitModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmissionSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">الملف المرفق للحل *</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="student-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                                <span>اختر ملفاً</span>
                                                <input 
                                                    id="student-file-upload" 
                                                    name="student-file-upload" 
                                                    type="file" 
                                                    required
                                                    className="sr-only"
                                                    onChange={(e) => setSubmissionFile(e.target.files[0])} 
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {submissionFile ? `الملف: ${submissionFile.name}` : 'PDF, Word, zip أو غيرها حتى 10 ميجا'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">ملاحظات أو تعليق</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300"
                                    value={submissionNotes}
                                    onChange={(e) => setSubmissionNotes(e.target.value)}
                                    placeholder="اكتب أي ملاحظات ترغب في إرسالها مع الحل..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsSubmitModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>إرسال الحل</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Teacher/TA Submissions Panel */}
            {isSubmissionsPanelOpen && activeAssignment && (
                <div className="fixed inset-y-0 left-0 right-0 lg:right-auto lg:w-[600px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">تسليمات الطلاب</h3>
                            <p className="text-xs text-gray-500">واجب: {activeAssignment.title_ar} ({submissions.length} تسليم)</p>
                        </div>
                        <button onClick={() => setIsSubmissionsPanelOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loadingSubmissions ? (
                            <div className="text-center py-20 text-gray-500">جاري تحميل التسليمات...</div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                                <FileText className="w-12 h-12 mb-4 text-gray-300" />
                                <p>لا توجد أي تسليمات من الطلاب حتى الآن</p>
                            </div>
                        ) : (
                            submissions.map((sub) => {
                                const isEditingThis = gradingSubmissionId === sub.id;

                                return (
                                    <div key={sub.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{sub.student_name}</h4>
                                                <p className="text-xs text-gray-400">الرقم الجامعي: {sub.student_number}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 font-semibold">{new Date(sub.submitted_at).toLocaleString('ar-EG')}</span>
                                        </div>

                                        {sub.notes && (
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4 flex items-start gap-1.5">
                                                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                                <span>{sub.notes}</span>
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                            {sub.file ? (
                                                <a
                                                    href={sub.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-primary-600 font-bold hover:underline"
                                                >
                                                    <Upload className="w-4 h-4 rotate-180" />
                                                    تحميل ملف الحل
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400">لا يوجد ملف</span>
                                            )}

                                            {!isSupervisor && (
                                                <div className="flex items-center gap-2">
                                                    {sub.score !== null && !isEditingThis && (
                                                        <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-100 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>الدرجة: {sub.score} / {activeAssignment.max_score}</span>
                                                        </span>
                                                    )}
                                                    
                                                    {!isEditingThis ? (
                                                        <button
                                                            onClick={() => handleStartGrading(sub)}
                                                            className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors"
                                                        >
                                                            {sub.score !== null ? 'تعديل الدرجة' : 'تصحيح ورصد'}
                                                        </button>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>

                                        {/* Grading Form Panel */}
                                        {isEditingThis && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-gray-700">درجة الطالب (من {activeAssignment.max_score}) *</label>
                                                        <input
                                                            required
                                                            type="number"
                                                            min="0"
                                                            max={activeAssignment.max_score}
                                                            step="0.1"
                                                            className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 text-sm"
                                                            value={gradeScore}
                                                            onChange={(e) => setGradeScore(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-gray-700">ملاحظات وملاحظات التصحيح</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-100 border-gray-300 text-sm"
                                                            value={gradeFeedback}
                                                            onChange={(e) => setGradeFeedback(e.target.value)}
                                                            placeholder="تغذية راجعة للطالب..."
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => setGradingSubmissionId(null)}
                                                        className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
                                                    >
                                                        إلغاء
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveGrade(sub.id)}
                                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                                                    >
                                                        رصد وحفظ
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentsManagement;
