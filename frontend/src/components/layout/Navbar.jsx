import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'الرئيسية', path: '/' },
        { name: 'عن الكلية', path: '/about' },
        { name: 'الأقسام', path: '/departments' },
        { name: 'الفعاليات', path: '/events' },
        { name: 'تواصل معنا', path: '/contact' },
    ];

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                            EC
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">جامعة الرباط الوطني </h1>
                            <p className="text-xs text-secondary-600 font-medium tracking-wide"> </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary-600 relative py-2",
                                    location.pathname === link.path
                                        ? "text-primary-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-600 after:rounded-full"
                                        : "text-gray-600"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-full font-medium text-sm hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 transition-all transform hover:-translate-y-0.5"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>دخول النظام</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-full shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="container mx-auto py-4 px-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                                    location.pathname === link.path
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <hr className="my-2 border-gray-100" />
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>دخول النظام</span>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
