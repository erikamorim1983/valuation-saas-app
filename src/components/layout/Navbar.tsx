'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navbar() {
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // Check initial auth state
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('🔍 Navbar - User check:', user ? 'Logged in' : 'Not logged in');
            setIsAuthenticated(!!user);
            setLoading(false);
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('🔄 Navbar - Auth state changed:', _event, session?.user ? 'Logged in' : 'Logged out');
            setIsAuthenticated(!!session?.user);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        console.log('🚪 Logout button clicked');
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        router.push(`/${locale}`);
        router.refresh();
    };

    return (
        <nav className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href={`/${locale}`} className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
                            BrixAurea Valuation
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href={`/${locale}/features`} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                            {t('features')}
                        </Link>
                        <Link href={`/${locale}/methodology`} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                            {t('methodology')}
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        {!loading && (
                            isAuthenticated ? (
                                <>
                                    <Link href={`/${locale}/dashboard`}>
                                        <Button variant="ghost" size="sm">Dashboard</Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="text-red-600 hover:text-red-700 hover:border-red-600 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <Link href="/login">
                                    <Button size="sm">Acessar o Sistema</Button>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
