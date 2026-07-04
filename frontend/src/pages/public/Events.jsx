import React, { useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Events = () => {
    // Mock data
    const EVENTS = [
        {
            id: 1,
            title: 'حفل استقبال الطلاب الجدد',
            date: '2026-02-15',
            time: '10:00 صباحاً',
            location: 'القاعة الكبرى',
            image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop',
            category: 'أنشطة طلابية'
        },
        {
            id: 2,
            title: 'ندوة الذكاء الاصطناعي ومستقبل العمل',
            date: '2026-02-20',
            time: '11:30 صباحاً',
            location: 'قاعة المؤتمرات - المبنى ب',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop',
            category: 'محاضرات علمية'
        },
        {
            id: 3,
            title: 'معرض مشاريع التخرج السنوي',
            date: '2026-03-01',
            time: '09:00 صباحاً',
            location: 'ساحة الكلية',
            image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop',
            category: 'معارض'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-primary-900 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">الفعاليات والأخبار</h1>
                    <p className="text-primary-200">تابع أحدث نشاطات الكلية والمناسبات القادمة</p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12">
                <div className="grid gap-8">
                    {EVENTS.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col md:flex-row h-full md:h-64"
                        >
                            <div className="md:w-1/3">
                                <img src={event.image} alt={event.title} className="w-full h-48 md:h-full object-cover" />
                            </div>
                            <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold">
                                            {event.category}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <span>{new Date(event.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-2 transition-colors">
                                        تفاصيل الفعالية <ArrowRight className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;
