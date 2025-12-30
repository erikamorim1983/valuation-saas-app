import { createClient } from '@/lib/supabase/server';
import { ValuationSimulator } from '@/components/dashboard/ValuationSimulator';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ValuationRecord } from '@/lib/supabase/valuation';

interface PageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function SimulatorPage({ params }: PageProps) {
    const { id, locale } = await params;
    const supabase = await createClient(); // Server client

    const { data: valuation, error } = await supabase
        .from('valuations')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !valuation) {
        return notFound();
    }

    if (!valuation) return notFound();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/${locale}/dashboard`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Simulador de Cenários
                    </h1>
                    <p className="text-sm text-gray-500">
                        Visualizando potencial para: <span className="font-medium text-gray-700 dark:text-gray-300">{valuation.company_name}</span>
                    </p>
                </div>
            </div>

            <ValuationSimulator valuation={valuation as ValuationRecord} />

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <h4 className="text-yellow-800 dark:text-yellow-200 font-bold mb-2">💡 Insight do Consultor</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Pequenas melhorias na governança e na recorrência da receita podem ter um impacto desproporcional no valor final da empresa, pois aumentam o <strong>Múltiplo</strong>. Focar em contratos de longo prazo e reduzir a dependência do dono são as alavancas mais rápidas para valorização.
                </p>
            </div>
        </div>
    );
}
