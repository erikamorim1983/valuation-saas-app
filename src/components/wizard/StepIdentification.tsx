'use client';

import { useWizard } from './WizardContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

// Simplified schema - only 'role' (Stage) is required for this step now
// Static data comes from the profile
const schema = z.object({
    role: z.enum(['idea', 'startup', 'operational', 'scaling']),
    currency: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function StepIdentification() {
    const { data, updateData, setStep, saveDraft, isSaving } = useWizard();
    const t = useTranslations('Wizard');
    const router = useRouter(); // Import useRouter at top level

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            role: data.role,
            currency: data.currency
        }
    });

    const onSubmit = (formData: FormData) => {
        updateData(formData);
        setStep('financials');
    };

    // If data is missing (not loaded from profile yet or user skipped onboarding), 
    // we could redirect or show a warning. For now, we assume WizardContext loaded it or user filled it previously.
    const hasProfile = data.companyName && data.companyName.length > 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Identificação & Estágio
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Confirme os dados da sua empresa e defina o estágio atual para o Valuation.
                </p>
            </div>

            {/* STATIC COMPANY PROFILE CARD */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Perfil da Empresa (Gravado)
                    </h3>
                    {/* Edit Link - could go to settings or show a modal */}
                    <div className="text-xs text-blue-600 hover:text-blue-500 cursor-not-allowed" title="Edição bloqueada para manter histórico">
                        🔒 Dados Verificados
                    </div>
                </div>

                {hasProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div>
                            <span className="block text-gray-500 dark:text-gray-400">Nome da Empresa</span>
                            <span className="font-medium text-gray-900 dark:text-white">{data.companyName}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 dark:text-gray-400">Website</span>
                            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {data.url || '-'}
                            </a>
                        </div>
                        <div>
                            <span className="block text-gray-500 dark:text-gray-400">Setor / Sub-Setor</span>
                            <span className="font-medium text-gray-900 dark:text-white">{data.sector} / {data.subSector}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 dark:text-gray-400">Ano Fundação</span>
                            <span className="font-medium text-gray-900 dark:text-white">{data.startingYear}</span>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <span className="block text-gray-500 dark:text-gray-400">Descrição</span>
                            <p className="text-gray-700 dark:text-gray-300 mt-1">{data.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Nenhum perfil de empresa encontrado.
                                    <a href="/onboarding" className="font-medium underline ml-1 hover:text-yellow-600">
                                        Clique aqui para completar seu cadastro.
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* DYNAMIC VALUATION FIELDS */}
                <div className="bg-blue-50 dark:bg-zinc-800/50 rounded-lg p-6 border border-blue-100 dark:border-zinc-700">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        Parâmetros do Valuation Atual
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('fields.stage')}
                            </label>
                            <select
                                {...register('role')}
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                            >
                                <option value="idea">{t('stages.idea')}</option>
                                <option value="startup">{t('stages.startup')}</option>
                                <option value="operational">{t('stages.operational')}</option>
                                <option value="scaling">{t('stages.scaling')}</option>
                            </select>
                            <p className="mt-2 text-xs text-gray-500">
                                O estágio define a metodologia e os riscos aplicados ao cálculo.
                            </p>
                        </div>

                        <div>
                            {/* Currency hidden for now, default to USD */}
                            <input type="hidden" {...register('currency')} value="USD" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={saveDraft} disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                    </Button>
                    <Button type="submit" disabled={!hasProfile}>
                        {t('buttons.next')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
