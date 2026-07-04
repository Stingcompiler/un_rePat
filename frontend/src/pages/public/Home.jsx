import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Users, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';

const Home = () => {
    const [departments, setDepartments] = useState([]);
    const [featuredEvents, setFeaturedEvents] = useState([]);

    useEffect(() => {
        // Fetch data from API - Mock functionality until backend is fully ready
        // api.get('/public/home').then(res => ...);
    }, []);

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center bg-gray-900 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-primary-600/20 rounded-full blur-3xl" />
                    <div className="absolute top-[30%] -left-[10%] w-[50vw] h-[50vw] bg-secondary-600/20 rounded-full blur-3xl opacity-60" />
                </div>

                {/* Background Image Overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1986&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-primary-300 text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
                            مستقبل التعليم في السودان
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                           جامعة الرباط الوطني
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
                               
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            نحن نبني جيلاً من المبتكرين والقادة، مسلحين بالمعرفة والمهارات اللازمة لصنع مستقبل مشرق. انضم إلينا في رحلة التميز الأكاديمي.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/departments"
                                className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 hover:scale-105"
                            >
                                <span>استكشف التخصصات</span>
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/contact"
                                className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
                            >
                                تواصل معنا
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats / Features */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: BookOpen, title: 'مناهج متطورة', desc: 'خطط دراسية تواكب أحدث المعايير العالمية وتلبي احتياجات سوق العمل.' },
                            { icon: Users, title: 'نخبة من الأساتذة', desc: 'كادر أكاديمي متميز من ذوي الخبرة والمعرفة العميقة في مجالاتهم.' },
                            { icon: Trophy, title: 'بيئة تعليمية محفزة', desc: 'مرافق حديثة ومعامل مجهزة لضمان أفضل تجربة تعليمية للطلاب.' },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-gray-100 group"
                            >
                                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About CTA */}
            <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed center"></div>
                <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">رؤيتنا للمستقبل</h2>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8">
                           
                            تسعى 
                         
                            جامعة الرباط الوطني

                             لتكون منارة للعلم والمعرفة، ومركزاً للبحث والابتكار، مساهمة في تنمية المجتمع وبناء اقتصاد المعرفة.
                        </p>
                        <Link to="/about" className="inline-flex items-center gap-2 text-primary-400 font-bold hover:text-primary-300 transition-colors">
                            اقرأ المزيد عن الكلية <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="w-64 h-64 bg-gradient-to-tr from-primary-600 to-secondary-600 rounded-full blur-[100px] opacity-50 absolute inset-0 animate-pulse"></div>
                        <Sparkles className="w-32 h-32 text-white/20 relative z-10" />
                    </div>
                </div>
            </section>

            {/* Events CTA Section */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-primary-900 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
                        {/* Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>

                        <div className="relative z-10 max-w-xl">
                            <div className="inline-block px-4 py-1.5 bg-primary-800 rounded-full text-primary-200 text-sm font-bold mb-6 border border-primary-700">
                                ✨ الفعاليات والأخبار
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                                كن في قلب الحدث مع كليتنا
                            </h2>
                            <p className="text-primary-100 text-lg leading-relaxed mb-8">
                                تابع أحدث أخبار الكلية، المؤتمرات العلمية، والأنشطة الطلابية. لا تفوت فرصة المشاركة في مجتمعنا الأكاديمي النشط.
                            </p>
                            <Link
                                to="/events"
                                className="inline-flex items-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg shadow-black/10"
                            >
                                عرض جميع الفعاليات
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="relative z-10 hidden md:block w-80">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-secondary-500 rounded-lg flex items-center justify-center text-white font-bold">
                                        15
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold opacity-80">فبراير 2026</p>
                                        <p className="text-xs opacity-60">القاعة الكبرى</p>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">حفل استقبال الطلاب الجدد</h3>
                                <p className="text-sm opacity-80 leading-relaxed mb-4">
                                    نرحب بطلابنا الجدد في رحاب جامعة الرباط الوطني ...
                                </p>
                                <Link to="/events" className="text-sm font-bold text-secondary-300 hover:text-white transition-colors">
                                    التفاصيل &larr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Departments Preview - To be dynamic */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">الأقسام الأكاديمية</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">تخصصات متنوعة تلبي طموحاتك وتفتح لك آفاق المستقبل.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Mock Departments */}
                        {[
                            'علوم الحاسوب', 'تقنية المعلومات', 'الهندسة المعمارية', 'إدارة الأعمال', 'المحاسبة', 'التصميم الجرافيكي'
                        ].map((dept, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex items-center justify-between group">
                                <span className="font-bold text-lg text-gray-800">{dept}</span>
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/departments" className="inline-block px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                            عرض جميع الأقسام
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
