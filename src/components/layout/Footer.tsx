import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export function Footer() {
    const t = useTranslations('Footer');
    const locale = useLocale();

    return (
        <footer className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 tracking-wider uppercase mb-4">{t('product')}</h3>
                        <ul className="space-y-4">
                            <li><Link href={`/${locale}/features`} className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{t('features')}</Link></li>
                            <li><Link href={`/${locale}/methodology`} className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{t('methodology')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 tracking-wider uppercase mb-4">{t('company')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{t('about')}</Link></li>
                            <li><Link href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{t('contact')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 tracking-wider uppercase mb-4">{t('legal')}</h3>
                        <ul className="space-y-4">
                            <li><Link href={`/${locale}/privacy`} className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{t('privacy')}</Link></li>
                            <li><Link href={`/${locale}/terms`} className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{t('terms')}</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-center items-center gap-6 text-center">
                    <p className="text-base text-gray-400">© 2025 MyValuation. {t('rights')}</p>
                    <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {t('developedBy')} <a href="https://www.eafinancialadvisory.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors">EA Financial Advisory Services</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
