import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/api/axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            // Mock API call if server is not running or handled
            // await api.post('/public/messages/', formData);

            // Simulate success for demo
            await new Promise(resolve => setTimeout(resolve, 1500));

            setStatus({ loading: false, success: true, error: null });
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            setStatus({
                loading: false,
                success: false,
                error: 'حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة مرة أخرى.'
            });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-primary-900 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">تواصل معنا</h1>
                    <p className="text-primary-200">نحن هنا للإجابة على استفساراتكم ومساعدتكم</p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">

                    {/* Contact Info */}
                    <div className="lg:w-1/3 bg-primary-800 text-white p-10 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-8">بيانات التواصل</h3>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">العنوان</h4>
                                        <p className="text-primary-100 text-sm leading-relaxed">
                                            الخرطوم، السودان<br />
                                            الجريف غرب، مربع 84<br />
                                            شرق شارع الستين
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">الهاتف</h4>
                                        <p className="text-primary-100 text-sm" dir="ltr">+249 123 456 789</p>
                                        <p className="text-primary-100 text-sm" dir="ltr">+249 987 654 321</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">البريد الإلكتروني</h4>
                                        <p className="text-primary-100 text-sm">info@ecst.edu.sd</p>
                                        <p className="text-primary-100 text-sm">admission@ecst.edu.sd</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">ساعات العمل</h4>
                                        <p className="text-primary-100 text-sm">
                                            الأحد - الخميس: 8:00 ص - 4:00 م<br />
                                            السبت: 9:00 ص - 2:00 م
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 relative z-10">
                            <div className="flex gap-4">
                                {/* Social Icons Placeholder */}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:w-2/3 p-10">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">أرسل لنا رسالة</h3>

                        {status.success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 text-green-700 p-8 rounded-xl flex flex-col items-center text-center border border-green-100"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold mb-2">تم الإرسال بنجاح!</h4>
                                <p>شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.</p>
                                <button
                                    onClick={() => setStatus({ success: false, loading: false, error: null })}
                                    className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    إرسال رسالة أخرى
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-gray-700">الاسم بالكامل</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                            placeholder="أدخل اسمك"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                            placeholder="exampe@mail.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">رقم الهاتف (اختياري)</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                            placeholder="0xxxxxxxxx"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium text-gray-700">موضوع الرسالة</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                            placeholder="سبب التواصل"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-gray-700">الرسالة</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                                        placeholder="اكتب رسالتك هنا..."
                                    ></textarea>
                                </div>

                                {status.error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                                        <AlertCircle className="w-5 h-5" />
                                        {status.error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status.loading}
                                    className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status.loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <span>إرسال الرسالة</span>
                                            <Send className="w-5 h-5 rotate-180" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-12 bg-gray-200 rounded-2xl h-96 w-full overflow-hidden shadow-sm">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15367.799732734682!2d32.55397576569824!3d15.589831519782483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x168e91dc67786445%3A0x6bba467142491b48!2sAl%20Manshiya%2C%20Khartoum%2C%20Sudan!5e0!3m2!1sen!2s!4v1706649123456!5m2!1sen!2s"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="University Location"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;
