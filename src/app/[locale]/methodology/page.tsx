import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export default function MethodologyPage() {
    const t = useTranslations('MethodologyPage');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-gray-100">

            {/* Hero / Cover Slide */}
            <section className="h-[80vh] flex flex-col justify-center items-center text-center p-8 bg-gradient-to-br from-blue-900 via-black to-black text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                <div className="z-10 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-blue-100 mb-12">
                        {t('hero.subtitle')}
                    </p>
                    <div className="text-sm font-mono text-blue-300/60 uppercase tracking-widest">
                        {t('hero.label')}
                    </div>
                </div>
            </section>

            {/* Slide 1: O Problema & Solução */}
            <section className="py-24 px-8 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl font-bold mb-8 text-blue-600 dark:text-blue-400">{t('problem.title')}</h2>
                    <ul className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
                        {['0', '1', '2'].map((i) => (
                            <li key={i} className="flex items-start">
                                <span className="text-red-500 mr-4 mt-1"><X className="w-6 h-6" /></span>
                                <div>{t(`problem.items.${i}`)}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800">
                    <h2 className="text-4xl font-bold mb-8 text-green-600 dark:text-green-400">{t('solution.title')}</h2>
                    <ul className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
                        {['0', '1', '2'].map((i) => (
                            <li key={i} className="flex items-start">
                                <span className="text-green-500 mr-4 mt-1"><Check className="w-6 h-6" /></span>
                                <div>
                                    <strong>{t(`solution.items.${i}.title`)}</strong> {t(`solution.items.${i}.desc`)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Slide 2: Engenharia de Valuation (As Fórmulas) */}
            <section className="py-24 bg-white dark:bg-zinc-900">
                <div className="max-w-7xl mx-auto px-8">
                    <h2 className="text-5xl font-bold text-center mb-4">{t('tech.title')}</h2>
                    <p className="text-xl text-center text-gray-500 dark:text-gray-400 mb-20 max-w-3xl mx-auto">
                        {t('tech.subtitle')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-12">

                        {/* DCF Engine */}
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl border-l-4 border-blue-500">
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                {t('methods.dcf.title')}
                                <span className="ml-auto text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">{t('methods.dcf.tag')}</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                {t('methods.dcf.desc')}
                            </p>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-inner overflow-x-auto">
                                <p className="mb-2"><span className="text-purple-500">WACC</span> = {t('methods.dcf.formula.wacc').split('=')[1]}</p>
                                <p className="mb-2"><span className="text-green-500">FCF</span> = {t('methods.dcf.formula.fcf').split('=')[1]}</p>
                                <p><span className="text-blue-500">Valor</span> = {t('methods.dcf.formula.val').split('=')[1]}</p>
                            </div>
                        </div>

                        {/* Multiples Engine */}
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl border-l-4 border-purple-500">
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                {t('methods.multiples.title')}
                                <span className="ml-auto text-xs font-mono bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-1 rounded">{t('methods.multiples.tag')}</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                {t('methods.multiples.desc')}
                            </p>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-inner overflow-x-auto">
                                <p className="mb-2">{t('methods.multiples.formula.w1')}</p>
                                <p className="mb-2">{t('methods.multiples.formula.w2')}</p>
                                <p>{t('methods.multiples.formula.range')}</p>
                            </div>
                        </div>

                        {/* Earnings Cap Engine */}
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl border-l-4 border-green-500">
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                {t('methods.earnings.title')}
                                <span className="ml-auto text-xs font-mono bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">{t('methods.earnings.tag')}</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                {t('methods.earnings.desc')}
                            </p>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-inner overflow-x-auto">
                                <p className="mb-2"><span className="text-green-500">SDE</span> ≈ {t('methods.earnings.formula.sde').split('≈')[1]}</p>
                                <p className="mb-2"><span className="text-red-500">CapRate</span> = {t('methods.earnings.formula.cap').split('=')[1]}</p>
                                <p><span className="text-blue-500">Valor</span> = {t('methods.earnings.formula.val').split('=')[1]}</p>
                            </div>
                        </div>

                        {/* Qualitative Engine */}
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl border-l-4 border-orange-500">
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                {t('methods.scorecard.title')}
                                <span className="ml-auto text-xs font-mono bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 px-2 py-1 rounded">{t('methods.scorecard.tag')}</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                {t('methods.scorecard.desc')}
                            </p>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-inner overflow-x-auto">
                                <p className="mb-2">{t('methods.scorecard.formula.weights')}</p>
                                <p className="mb-2">{t('methods.scorecard.formula.score')}</p>
                                <p><span className="text-blue-500">Ajuste</span> = {t('methods.scorecard.formula.adj').split('=')[1]}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA Slide */}
            <section className="py-24 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-4xl font-bold mb-8">{t('cta.title')}</h2>
                <p className="text-xl text-gray-500 mb-10">{t('cta.subtitle')}</p>
                <div className="flex gap-4">
                    <Link href="/valuation/new">
                        <Button size="lg" className="px-10 py-6 text-lg">{t('cta.button')}</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" size="lg" className="px-10 py-6 text-lg">{t('cta.back')}</Button>
                    </Link>
                </div>
            </section>

        </div>
    );
}
