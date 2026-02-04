'use client';

import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { createUserProfile } from '@/lib/supabase/userProfile';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';

export default function ProfileSelectionPage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('ProfileSelection');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // User not authenticated, redirect to login
                router.push(`/${locale}/login`);
                return;
            }

            setChecking(false);
        };

        checkAuth();
    }, [router, locale]);

    const handleSelectConsultant = async () => {
        setLoading(true);
        try {
            await createUserProfile({
                user_type: 'consultant',
                full_name: undefined, // Will be filled in onboarding
                phone: undefined,
                company_name: undefined,
                specialization: undefined,
                professional_id: undefined
            });
            router.push(`/${locale}/onboarding/consultant`);
        } catch (error) {
            console.error('Error creating consultant profile:', error);
            alert('Error creating profile. Please try again.');
            setLoading(false);
        }
    };

    const handleSelectBusinessOwner = async () => {
        setLoading(true);
        try {
            await createUserProfile({
                user_type: 'business_owner',
                full_name: undefined, // Will be filled in onboarding
                phone: undefined,
                company_name: undefined,
                specialization: undefined,
                professional_id: undefined
            });
            router.push(`/${locale}/onboarding/business-owner`);
        } catch (error) {
            console.error('Error creating business owner profile:', error);
            alert('Error creating profile. Please try again.');
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-zinc-900 dark:via-black dark:to-zinc-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-zinc-900 dark:via-black dark:to-zinc-900 py-12 px-4">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-8">
                        <Logo href={`/${locale}`} size="lg" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        {t('welcome')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Consultant Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-blue-200 dark:border-blue-900 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="text-center">
                            <div className="text-6xl mb-4">👔</div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t('consultant.title')}
                            </h2>
                            <div className="text-left space-y-3 mb-8">
                                <p className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span>{t('consultant.feature1')}</span>
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span>{t('consultant.feature2')}</span>
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span>{t('consultant.feature3')}</span>
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span>{t('consultant.feature4')}</span>
                                </p>
                            </div>
                            <Button
                                onClick={handleSelectConsultant}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                            >
                                {loading ? 'Creating profile...' : t('consultant.button')}
                            </Button>
                        </div>
                    </div>

                    {/* Business Owner Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-green-200 dark:border-green-900 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🏢</div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t('businessOwner.title')}
                            </h2>
                            <div className="text-left space-y-3 mb-8">
                                <p className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span>{t('businessOwner.feature1')}</span>
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span>{t('businessOwner.feature2')}</span>
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span>{t('businessOwner.feature3')}</span>
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span>{t('businessOwner.feature4')}</span>
                                </p>
                            </div>
                            <Button
                                onClick={handleSelectBusinessOwner}
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                            >
                                {loading ? 'Creating profile...' : t('businessOwner.button')}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('note')}
                    </p>
                </div>
            </div>
        </div>
    );
}
