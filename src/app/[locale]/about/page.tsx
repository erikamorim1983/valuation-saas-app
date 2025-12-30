'use client';

import { useTranslations } from 'next-intl';
import { Target, Eye, ShieldCheck, Zap } from 'lucide-react';

export default function AboutPage() {
    const t = useTranslations('AboutPage');

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black">
            {/* Hero Section */}
            <section className="relative py-24 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-gray-900 to-black z-0"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Mission & Vision */}
                    <div className="space-y-12">
                        <div className="flex gap-6 group">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t('content.mission.title')}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                                    {t('content.mission.text')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 group">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t('content.vision.title')}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                                    {t('content.vision.text')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Values Card */}
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-10 border border-gray-100 dark:border-zinc-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-zinc-800 pb-4">
                            {t('content.values.title')}
                        </h2>

                        <ul className="space-y-6">
                            {[0, 1, 2, 3].map((i) => (
                                <li key={i} className="flex items-center gap-4 text-lg font-medium text-gray-700 dark:text-gray-200">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    {t(`content.values.items.${i}`)}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-12 p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                            <Zap className="w-8 h-8 text-blue-500 animate-pulse" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Impulsionado pela metodologia proprietária da <span className="text-blue-600 dark:text-blue-400 font-bold underline cursor-pointer">EA Financial Advisory</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brands Section (Optional/Social Proof Placeholder) */}
            <section className="py-20 border-t border-gray-100 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-900/20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-12">Confiança e Credibilidade</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* These would be logos */}
                        <div className="text-2xl font-black text-gray-400">FINTECH</div>
                        <div className="text-2xl font-black text-gray-400">STRATEGY</div>
                        <div className="text-2xl font-black text-gray-400">ADVISORY</div>
                        <div className="text-2xl font-black text-gray-400">EQUITY</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
