import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                EC
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg leading-tight">جامعة الرباط الوطني </h2>
                                <p className="text-primary-400 text-xs font-medium"> </p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            صرح تعليمي رائد يهدف إلى تقديم تعليم عالي الجودة يواكب التطورات العالمية في مجالات العلوم والتكنولوجيا.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 after:content-[''] after:h-1 after:w-8 after:bg-primary-500 after:rounded-full after:mr-3">
                            روابط سريعة
                        </h3>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="hover:text-primary-400 transition-colors text-sm">عن الكلية</Link></li>
                            <li><Link to="/departments" className="hover:text-primary-400 transition-colors text-sm">الأقسام الأكاديمية</Link></li>
                            <li><Link to="/events" className="hover:text-primary-400 transition-colors text-sm">الفعاليات والأخبار</Link></li>
                            <li><Link to="/login" className="hover:text-primary-400 transition-colors text-sm">البوابة الأكاديمية</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 after:content-[''] after:h-1 after:w-8 after:bg-primary-500 after:rounded-full after:mr-3">
                            تواصل معنا
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm">
                                <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                                <span>الخرطوم، السودان - الجريف غرب</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                                <span dir="ltr">+249 123 456 789</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>info@ecst.edu.sd</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / Social */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 after:content-[''] after:h-1 after:w-8 after:bg-primary-500 after:rounded-full after:mr-3">
                            تابعنا
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">كن على اطلاع دائم بآخر أخبار الكلية والفعاليات.</p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all transform hover:-translate-y-1">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-all transform hover:-translate-y-1">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} جامعة الرباط الوطني   . جميع الحقوق محفوظة.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/policies/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                        <Link to="/policies/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
