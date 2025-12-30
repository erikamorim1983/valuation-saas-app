import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PitchDeckPage() {
    // For now we will use hardcoded text to ensure richness as per user request "em portugues"
    // and to avoid massive JSON updates. We can refactor to i18n later.

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-gray-100">

            {/* Hero / Cover Slide */}
            <section className="h-screen flex flex-col justify-center items-center text-center p-8 bg-gradient-to-br from-blue-900 via-black to-black text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                <div className="z-10 max-w-4xl">
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                        MyValuation
                    </h1>
                    <p className="text-2xl md:text-3xl font-light text-blue-100 mb-12">
                        A Plataforma Definitiva de Valuation para Negócios Digitais
                    </p>
                    <div className="text-sm font-mono text-blue-300/60 uppercase tracking-widest">
                        Pitch Deck Institucional
                    </div>
                </div>
            </section>

            {/* Slide 1: O Problema & Solução */}
            <section className="py-24 px-8 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl font-bold mb-8 text-blue-600 dark:text-blue-400">O Desafio</h2>
                    <ul className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
                        <li className="flex items-start">
                            <span className="text-red-500 mr-4 text-2xl">✕</span>
                            Valuation tradicional é <strong>caro</strong> (R$ 15k+) e <strong>lento</strong> (semanas).
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-4 text-2xl">✕</span>
                            Falta de dados comparativos confiáveis para PMEs e Startups.
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-4 text-2xl">✕</span>
                            Subjetividade excessiva em planilhas de Excel complexas e sujeitas a erros.
                        </li>
                    </ul>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800">
                    <h2 className="text-4xl font-bold mb-8 text-green-600 dark:text-green-400">A Solução</h2>
                    <ul className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
                        <li className="flex items-start">
                            <span className="text-green-500 mr-4 text-2xl">✓</span>
                            <strong>Automatizado & Instantâneo:</strong> Relatórios profissionais em minutos.
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 mr-4 text-2xl">✓</span>
                            <strong>Multimetodologia:</strong> Combina 4 motores de cálculo distintos.
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 mr-4 text-2xl">✓</span>
                            <strong>Acessível:</strong> Democratizando o valuation para qualquer empreendedor.
                        </li>
                    </ul>
                </div>
            </section>

            {/* Slide 2: Engenharia de Valuation (As Fórmulas) */}
            <section className="py-24 bg-white dark:bg-zinc-900">
                <div className="max-w-7xl mx-auto px-8">
                    <h2 className="text-5xl font-bold text-center mb-4">Nossa Tecnologia</h2>
                    <p className="text-xl text-center text-gray-500 dark:text-gray-400 mb-20 max-w-3xl mx-auto">
                        Utilizamos uma abordagem híbrida ponderada, combinando fluxos de caixa futuros, múltiplos de mercado e ativos intangíveis.
                    </p>

                    <div className="grid md:grid-cols-2 gap-12">

                        {/* DCF Engine */}
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl border-l-4 border-blue-500">
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                1. Discounted Cash Flow (DCF)
                                <span className="ml-auto text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">Crescimento</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                Projeta o potencial futuro do negócio. Ideal para startups escaláveis.
                            </p>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-inner overflow-x-auto">
                                <p className="mb-2"><span className="text-purple-500">WACC</span> = Rf + ERP + RiscoEspecífico + SizePremium(5%)</p>
                                <p className="mb-2"><span className="text-green-500">FCF</span> = EBITDA × (1 - TaxRate) - CapexEstimado</p>
                                <p><span className="text-blue-500">Valor</span> = Σ(FCF / (1+WACC)^t) + TerminalValue</p>
                            </div>
                        </div>

                        {/* Multiples Engine */}
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl border-l-4 border-purple-500">
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                2. Múltiplos de Mercado
                                <span className="ml-auto text-xs font-mono bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-1 rounded">Comparativo</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                Baliza o valor com base em transações reais do setor (SaaS, Fintech, E-commerce).
                            </p>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-inner overflow-x-auto">
                                <p className="mb-2">SaaS Weight: <span className="text-blue-500">70% Receita</span> / 30% EBITDA</p>
                                <p className="mb-2">Traditional Weight: 30% Receita / <span className="text-green-500">70% EBITDA</span></p>
                                <p>Range = BaseMetric × SectorMultiple [Min, Max]</p>
                            </div>
                        </div>

                        {/* Earnings Cap Engine */}
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl border-l-4 border-green-500">
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                3. Capitalização de Lucros
                                <span className="ml-auto text-xs font-mono bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">Estabilidade</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                Focado na capacidade atual de gerar caixa (SDE). Ideal para "Lifestyle Businesses".
                            </p>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-inner overflow-x-auto">
                                <p className="mb-2"><span className="text-green-500">SDE</span> ≈ Lucro Líquido + AddBacks (5% OpEx)</p>
                                <p className="mb-2"><span className="text-red-500">CapRate</span> = 20% (Base) + Risco Específico</p>
                                <p><span className="text-blue-500">Valor</span> = SDE / CapRate</p>
                            </div>
                        </div>

                        {/* Qualitative Engine */}
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl border-l-4 border-orange-500">
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                4. Scorecard Qualitativo
                                <span className="ml-auto text-xs font-mono bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 px-2 py-1 rounded">Intangíveis</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                Corrige o valor financeiro com base em ativos intangíveis como time e mercado.
                            </p>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-inner overflow-x-auto">
                                <p className="mb-2">Pesos: Time(30%), Produto(25%), Mercado(25%), Competição(20%)</p>
                                <p className="mb-2">Score (0-10) vs Baseline (5)</p>
                                <p><span className="text-blue-500">Ajuste</span> = ((Score - 5) / 5) × 30% (Max Premium/Discount)</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA Slide */}
            <section className="py-24 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-4xl font-bold mb-8">Pronto para o Próximo Nível?</h2>
                <p className="text-xl text-gray-500 mb-10">O MyValuation traz clareza para a complexidade.</p>
                <div className="flex gap-4">
                    <Link href="/valuation/new">
                        <Button size="lg" className="px-10 py-6 text-lg">Iniciar Valuation Agora</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" size="lg" className="px-10 py-6 text-lg">Voltar ao Início</Button>
                    </Link>
                </div>
            </section>

        </div>
    );
}
