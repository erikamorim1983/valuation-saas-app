import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Calculator, TrendingUp, LayoutDashboard, Save, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function FeaturesPage() {
    const t = useTranslations('FeaturesPage');
    const tCTA = useTranslations('CTA');

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black">
            {/* Hero Section */}
            <section className="relative py-24 bg-gray-900 border-b border-gray-800">
                <div className="absolute inset-0 z-0 opacity-20">
                    {/* Abstract background pattern could go here */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard
                        icon={<Calculator className="w-8 h-8 text-blue-500" />}
                        title={t('core.valuation.title')}
                        desc={t('core.valuation.desc')}
                    />
                    <FeatureCard
                        icon={<TrendingUp className="w-8 h-8 text-green-500" />}
                        title={t('core.simulator.title')}
                        desc={t('core.simulator.desc')}
                    />
                    <FeatureCard
                        icon={<LayoutDashboard className="w-8 h-8 text-purple-500" />}
                        title={t('core.dashboard.title')}
                        desc={t('core.dashboard.desc')}
                    />
                    <FeatureCard
                        icon={<Save className="w-8 h-8 text-orange-500" />}
                        title={t('core.persistence.title')}
                        desc={t('core.persistence.desc')}
                    />
                </div>
            </section>

            {/* Deep Dive 1: Wizard */}
            <section className="py-20 bg-gray-50 dark:bg-zinc-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Inteligência Guiada
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t('deepDive.wizard.title')}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            {t('deepDive.wizard.desc')}
                        </p>
                        <ul className="space-y-3 pt-4">
                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Múltiplos setores e nichos
                            </li>
                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Análise financeira automática
                            </li>
                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Scorecard de riscos completo
                            </li>
                        </ul>
                    </div>
                    {/* Placeholder for Image/Screenshot */}
                    <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 h-[400px] flex items-center justify-center text-gray-400">
                        {/* TODO: Add Wizard Screenshot */}
                        <div className="text-center p-8">
                            <LayoutDashboard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <span>Wizard Interface Preview</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Dive 2: Simulator */}
            <section className="py-20 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row-reverse items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Planejamento Estratégico
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t('deepDive.simulator.title')}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            {t('deepDive.simulator.desc')}
                        </p>
                        <ul className="space-y-3 pt-4">
                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span> Ajuste de crescimento
                            </li>
                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span> Impacto da governança
                            </li>
                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span> Cálculo em tempo real
                            </li>
                        </ul>
                    </div>
                    {/* Placeholder for Image/Screenshot */}
                    <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl border border-gray-700 h-[400px] flex items-center justify-center text-gray-400">
                        {/* TODO: Add Simulator Screenshot */}
                        <div className="text-center p-8">
                            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-80" />
                            <span className="text-green-400">Simulator Preview</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-blue-600 dark:bg-blue-900 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-extrabold text-white mb-6">
                        {tCTA('title')}
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        {tCTA('subtitle')}
                    </p>
                    <Link href="/valuation/new">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg shadow-xl border-none">
                            {tCTA('button')} <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="mb-6 p-3 bg-gray-50 dark:bg-zinc-800 w-fit rounded-xl">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                {desc}
            </p>
        </div>
    );
}
