import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, FileText, ChevronLeft } from 'lucide-react';

const Policies = () => {
    const { type } = useParams();
    const [content, setContent] = useState(null);

    useEffect(() => {
        // Mock data fetching based on type
        if (type === 'privacy') {
            setContent({
                title: 'سياسة الخصوصية',
                icon: Shield,
                updatedAt: '2026-01-01',
                sections: [
                    {
                        heading: 'جمع المعلومات',
                        text: 'نقوم بجمع المعلومات التي تقدمها لنا مباشرة، مثل عند التسجيل كطالب، أو ملء نماذج الاتصال. تشمل هذه المعلومات الاسم، البريد الإلكتروني، ورقم الهاتف.'
                    },
                    {
                        heading: 'استخدام المعلومات',
                        text: 'نستخدم المعلومات لتقديم الخدمات التعليمية، التواصل معك بخصوص التحديثات الأكاديمية، وتحسين تجربة المستخدم على منصتنا.'
                    },
                    {
                        heading: 'حماية البيانات',
                        text: 'نتخذ إجراءات أمنية صارمة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفشاء.'
                    }
                ]
            });
        } else if (type === 'terms') {
            setContent({
                title: 'الشروط والأحكام',
                icon: FileText,
                updatedAt: '2026-01-01',
                sections: [
                    {
                        heading: 'قبول الشروط',
                        text: 'باستخدامك لموقع الكلية ومنصاتها الإلكترونية، فإنك توافق على الالتزام بهذه الشروط والأحكام وجميع القوانين المعمول بها.'
                    },
                    {
                        heading: 'حقوق الملكية الفكرية',
                        text: 'جميع المحتويات المنشورة على الموقع (نصوص، صور، شعارات) هي ملك للكلية الإماراتية للعلوم والتكنولوجيا ومحمية بموجب قوانين حقوق النشر.'
                    },
                    {
                        heading: 'سلوك المستخدم',
                        text: 'يجب استخدام المنصة لأغراض مشروعة وأكاديمية فقط. يمنع أي استخدام قد يضر بالبنية التحتية للموقع أو يزعج المستخدمين الآخرين.'
                    }
                ]
            });
        }
    }, [type]);

    if (!content) {
        return <div className="min-h-screen flex items-center justify-center p-20">جاري التحميل...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary-50 p-8 border-b border-primary-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-primary-600">
                            <content.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
                            <p className="text-gray-500 text-sm">آخر تحديث: {content.updatedAt}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600">
                            {content.sections.map((section, idx) => (
                                <div key={idx} className="mb-8 last:mb-0">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <ChevronLeft className="w-5 h-5 text-primary-500" />
                                        {section.heading}
                                    </h3>
                                    <p className="leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
                                        {section.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Policies;
