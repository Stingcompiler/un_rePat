import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Monitor, Cpu, PenTool, Database, Building2, Calculator, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';

// Mock data until backend connectivity is fully tested
const MOCK_DEPARTMENTS = [
    {
        id: 1,
        name: 'علوم الحاسوب',
        description: 'دراسة الأسس النظرية والتطبيقة للحوسبة، وتصميم البرمجيات والخوارزميات.',
        icon: Monitor,
        color: 'bg-blue-500'
    },
    {
        id: 2,
        name: 'تقنية المعلومات',
        description: 'التركيز على البنية التحتية للشبكات، أمن المعلومات، وإدارة الأنظمة التقنية.',
        icon: Database,
        color: 'bg-indigo-500'
    },
    {
        id: 3,
        name: 'هندسة البرمجيات',
        description: 'تطبيق المبادئ الهندسية لتطوير أنظمة برمجية معقدة وعالية الجودة.',
        icon: Cpu,
        color: 'bg-violet-500'
    },
    {
        id: 4,
        name: 'نظم المعلومات الإدارية',
        description: 'دمج التكنولوجيا مع الإدارة لدعم اتخاذ القرار وتحسين العمليات التجارية.',
        icon: Building2,
        color: 'bg-emerald-500'
    },
    {
        id: 5,
        name: 'التصميم الجرافيكي والوسائط',
        description: 'إبداع المحتوى البصري والرقمي باستخدام أحدث أدوات التصميم.',
        icon: PenTool,
        color: 'bg-rose-500'
    },
    {
        id: 6,
        name: 'المحاسبة والتمويل',
        description: 'إعداد كوادر مؤهلة في المجالات المالية والمحاسبية والمصرفية.',
        icon: Calculator,
        color: 'bg-amber-500'
    },
    {
        id: 7,
        name: 'علوم المختبرات',
        description: 'دراسة متعمقة للتحاليل الطبية والكيميائية باستخدام تقنيات حديثة.',
        icon: FlaskConical,
        color: 'bg-cyan-500'
    }
];

const Departments = () => {
    const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDepartments = departments.filter(dept =>
        dept.name.includes(searchTerm)
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-primary-900 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">الأقسام الأكاديمية</h1>
                    <p className="text-primary-200">اكتشف التخصصات المتاحة واختر مسارك المستقبلي</p>
                </div>
            </div>

            {/* Search & Grid */}
            <div className="container mx-auto px-4 -mt-8">
                <div className="bg-white p-4 rounded-xl shadow-lg max-w-2xl mx-auto mb-12 flex items-center gap-4">
                    <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="ابحث عن تخصص..."
                        className="w-full bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredDepartments.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        لا توجد أقسام مطابقة لبحثك.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDepartments.map((dept, idx) => (
                            <motion.div
                                key={dept.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100"
                            >
                                <div className={`h-2 ${dept.color}`}></div>
                                <div className="p-8">
                                    <div className={`w-14 h-14 ${dept.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6 text-${dept.color.split('-')[1]}-600 group-hover:scale-110 transition-transform duration-300`}>
                                        <dept.icon className={`w-7 h-7 text-${dept.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                                        {dept.name}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {dept.description}
                                    </p>
                                    {/* <Link 
                    to={`/departments/${dept.id}`} 
                    className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-700"
                  >
                    عرض التفاصيل
                    <svg className="w-4 h-4 mr-1 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link> */}
                                    <button className="w-full py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors cursor-not-allowed" disabled>
                                        قريباً: الخطط الدراسية
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Departments;
