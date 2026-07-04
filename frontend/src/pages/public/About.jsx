import React from 'react';
import { motion } from 'framer-motion';
import { Award, Target, Eye, History, Users, CheckCircle } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-primary-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        عن الكلية
                    </motion.h1>
                    <p className="text-xl text-primary-200">رحلة التميز والريادة في التعليم العالي</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* Intro */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">من نحن</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      جامعة الرباط الوطني
                        هي مؤسسة تعليمية رائدة تقع في قلب العاصمة السودانية الخرطوم. تأسست برؤية ثاقبة تهدف إلى سد الفجوة بين التعليم النظري ومتطلبات سوق العمل المتطورة. نحن نؤمن بأن التعليم هو حجر الزاوية في بناء الأمم، ونسعى جاهدين لتقديم تجربة تعليمية فريدة تمزج بين الأصالة والمعاصرة.
                    </p>
                </div>

                {/* Vision & Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center"
                    >
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                            <Eye className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">رؤيتنا</h3>
                        <p className="text-gray-600">
                            أن نكون المؤسسة التعليمية الرائدة في المنطقة، والمفضلة للطلاب والباحثين عن التميز، ونموذجاً يحتذى به في جودة التعليم والبحث العلمي وخدمة المجتمع.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center"
                    >
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <Target className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">رسالتنا</h3>
                        <p className="text-gray-600">
                            إعداد كوادر بشرية مؤهلة علمياً ومهنياً وأخلاقياً، قادرة على المنافسة في سوق العمل والمساهمة الفاعلة في التنمية المستدامة، من خلال بيئة تعليمية محفزة ومناهج متطورة.
                        </p>
                    </motion.div>
                </div>

                {/* Values */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">قيمنا الجوهرية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "التميز", desc: "نسعى دائمًا للأفضل في كل ما نقوم به." },
                            { title: "الابتكار", desc: "نشجع التفكير الإبداعي والحلول الجديدة." },
                            { title: "النزاهة", desc: "نلتزم بأعلى المعايير الأخلاقية والشفافية." },
                            { title: "العمل الجماعي", desc: "نؤمن بقوة التعاون والشراكة." },
                            { title: "المسؤولية", desc: "نستشعر مسؤوليتنا تجاه مجتمعنا وطلابنا." },
                            { title: "التعلم المستمر", desc: "نغرس حب المعرفة والتطوير الذاتي." }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border-r-4 border-primary-500 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-primary-500" />
                                    <h4 className="text-xl font-bold text-gray-800">{value.title}</h4>
                                </div>
                                <p className="text-gray-600 text-sm">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Objectives */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">أهداف الكلية</h2>
                    <ul className="space-y-4 max-w-4xl mx-auto">
                        {[
                            "توفير تعليم نوعي متميز يتوافق مع المعايير العالمية.",
                            "تطوير المناهج الدراسية بشكل مستمر لمواكبة التطورات التقنية.",
                            "تشجيع البحث العلمي ودعم مشاريع الطلاب الابتكارية.",
                            "بناء شراكات استراتيجية مع مؤسسات تعليمية وقطاعات صناعية.",
                            "تنمية مهارات الطلاب القيادية والشخصية ليكونوا فاعلين في المجتمع."
                        ].map((goal, idx) => (
                            <li key={idx} className="flex items-start gap-4">
                                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                                    <span className="text-sm font-bold">{idx + 1}</span>
                                </div>
                                <span className="text-lg text-gray-700">{goal}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default About;
