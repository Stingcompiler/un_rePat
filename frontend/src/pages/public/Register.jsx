import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Mail, Phone, Lock, Hash, AlertCircle } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        university_number: '',
        email: '',
        phone: '',
        password: '',
        password_confirm: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth(); // We'll use this to auto-login after registration
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (formData.password !== formData.password_confirm) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }

        setLoading(true);

        try {
            // Register
            const response = await api.post('/auth/register/', {
                university_number: formData.university_number,
                password: formData.password,
                password_confirm: formData.password_confirm,
                email: formData.email,
                phone: formData.phone
            });

            // Auto login or redirect to login (Assuming backend returns tokens or we just auto-login)
            // Since the backend sets cookies on registration success in StudentRegistrationView, we can update the auth context

            // Force reload auth state
            window.location.href = '/dashboard';

        } catch (err) {
            if (err.response?.data) {
                // Handle validation errors
                const verifyError = err.response.data.university_number || err.response.data.non_field_errors;
                setError(verifyError ? verifyError[0] : 'فشل إنشاء الحساب. تأكد من صحة البيانات.');
            } else {
                setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 h-screen overflow-hidden">
            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-y-auto">
                <div className="absolute top-8 right-8">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>العودة للرئيسية</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md py-10"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-secondary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-secondary-500/30">
                            EC
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">حساب طالب جديد</h2>
                        <p className="text-gray-500">قم بإنشاء حسابك للوصول إلى البوابة الأكاديمية</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">الرقم الجامعي</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                    <Hash className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="university_number"
                                    required
                                    value={formData.university_number}
                                    onChange={handleChange}
                                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="مثال: 01-19-00123"
                                />
                            </div>
                            <p className="text-xs text-gray-500">يجب أن يكون رقمك الجامعي مسجلاً مسبقاً في قاعدة بيانات الجامعة</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                        placeholder="اختياري"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">رقم الهاتف</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                        placeholder="اختياري"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">كلمة المرور</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">تأكيد كلمة المرور</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    name="password_confirm"
                                    required
                                    value={formData.password_confirm}
                                    onChange={handleChange}
                                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>إنشاء الحساب</span>
                                    <UserPlus className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        لديك حساب بالفعل؟ <Link to="/login" className="text-primary-600 font-bold hover:underline">تسجيل الدخول</Link>
                    </div>
                </motion.div>
            </div>

            {/* Left Side - Image/Banner */}
            <div className="hidden md:flex w-1/2 bg-secondary-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 via-secondary-800 to-transparent opacity-90"></div>

                <div className="relative z-10 text-center text-white p-12 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl font-bold mb-6">انضم لمجتمعنا الأكاديمي</h1>
                        <p className="text-secondary-100 text-lg leading-relaxed mb-8">
                            الخطوة الأولى نحو مستقبلك المهني تبدأ من هنا. سجل الآن للوصول إلى مقرراتك الدراسية، متابعة درجاتك، والتفاعل مع أساتذتك.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <div className="flex -space-x-4 space-x-reverse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-12 h-12 rounded-full border-2 border-secondary-800 bg-gray-${300 + i * 100} flex items-center justify-center bg-cover bg-center`} style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }}></div>
                                ))}
                                <div className="w-12 h-12 rounded-full border-2 border-secondary-800 bg-secondary-700 flex items-center justify-center text-xs font-bold">
                                    +200
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-secondary-300">طالب انضموا إلينا هذا الأسبوع</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Register;
