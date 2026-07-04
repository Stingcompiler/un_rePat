import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'فشل تسجيل الدخول. تأكد من البيانات وحاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 h-screen overflow-hidden">
            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="absolute top-8 right-8">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>العودة للرئيسية</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-primary-500/30">
                            EC
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بعودتك</h2>
                        <p className="text-gray-500">سجل الدخول للمتابعة إلى البوابة الأكاديمية</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <label className="text-sm font-semibold text-gray-700">اسم المستخدم / الرقم الجامعي</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="أدخل اسم المستخدم"
                                />
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
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                <span className="text-gray-600">تذكرني</span>
                            </label>
                            <a href="#" className="text-primary-600 font-medium hover:text-primary-700">نسيت كلمة المرور؟</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>تسجيل الدخول</span>
                                    <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        ليس لديك حساب؟ <Link to="/register" className="text-primary-600 font-bold hover:underline">أنشئ حساب جديد</Link>
                    </div>
                </motion.div>
            </div>

            {/* Left Side - Image/Banner */}
            <div className="hidden md:flex w-1/2 bg-primary-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592280771190-3e2e4d50c20f?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-900 via-primary-800 to-transparent opacity-90"></div>

                <div className="relative z-10 text-center text-white p-12 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl font-bold mb-6">جامعة الرباط الوطني   </h1>
                        <p className="text-primary-200 text-lg leading-relaxed mb-8">
                            بوابة التعليم الإلكتروني الموحدة. تابع دروسك، درجاتك، وتواصل مع أساتذتك في بيئة تعليمية متكاملة.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 w-32">
                                <span className="block text-3xl font-bold mb-1">25+</span>
                                <span className="text-xs text-primary-200">تخصص أكاديمي</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 w-32">
                                <span className="block text-3xl font-bold mb-1">5000+</span>
                                <span className="text-xs text-primary-200">طالب وطالبة</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
