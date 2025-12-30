import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLocale } from 'next-intl';

export function Navbar() {
    const t = useTranslations('Navbar');
    const locale = useLocale();

    return (
        <nav className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href={`/${locale}`} className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            MyValuation
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
                        <Link href="/login">
                            <Button variant="ghost" size="sm">{t('signIn')}</Button>
                        </Link>
                        <Link href={`/${locale}/valuation/new`}>
                            <Button size="sm">{t('getStarted')}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
