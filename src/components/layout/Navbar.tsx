'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';

export function Navbar() {
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        let mounted = true;

        // Check initial auth state
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!mounted) return;
                
                console.log('🔍 Navbar - User check:', user ? 'Logged in' : 'Not logged in');
                setIsAuthenticated(!!user);
            } catch (error) {
                console.error('❌ Navbar - Error checking auth:', error);
                if (mounted) {
                    setIsAuthenticated(false);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                    setIsInitialized(true);
                }
            }
        };

        checkAuth();

        // Listen for auth changes only after initialization
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted || !isInitialized) return;
            
            console.log('🔄 Navbar - Auth state changed:', _event, session?.user ? 'Logged in' : 'Logged out');
            setIsAuthenticated(!!session?.user);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [isInitialized]);

    const handleLogout = async () => {
        if (loading || !isInitialized) {
            console.warn('⚠️ Navbar - Logout attempted before auth initialization');
            return;
        }

        console.log('🚪 Logout button clicked');
        setLoading(true);
        
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            router.push(`/${locale}`);
            router.refresh();
        } catch (error) {
            console.error('❌ Navbar - Error during logout:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <nav className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Logo href={`/${locale}`} size="md" />
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href={`/${locale}/features`} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                            {t('features')}
                        </Link>
                        <Link href={`/${locale}/methodology`} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                            {t('methodology')}
                        </Link>

                        {/* Empresa Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors py-2">
                                {t('company')}
                                <svg className="ml-1 w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="p-2">
                                    <Link href={`/${locale}/about`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                        {t('about')}
                                    </Link>
                                    <Link href={`/${locale}/contact`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                        {t('contact')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        {!loading && (
                            isAuthenticated ? (
                                <>
                                    <Link href={`/${locale}/dashboard`}>
                                        <Button variant="ghost" size="sm">{t('dashboard')}</Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="text-red-600 hover:text-red-700 hover:border-red-600 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        {t('logout')}
                                    </Button>
                                </>
                            ) : (
                                <Link href="/login">
                                    <Button size="sm">{t('signIn')}</Button>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
