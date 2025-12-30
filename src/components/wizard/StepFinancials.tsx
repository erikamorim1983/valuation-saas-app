import { useWizard } from './WizardContext';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

const yearlySchema = z.object({
    year: z.number(),
    revenue: z.number().min(0),
    ebitda: z.number(),
    netIncome: z.number(),
    cogs: z.number().min(0),
    operatingExpenses: z.number().min(0),
    addbacks: z.number().optional().default(0),
    ownerAdj: z.number().optional().default(0),
    oneTime: z.number().optional().default(0),
});

const schema = z.object({
    history: z.array(yearlySchema),
    cash: z.number().min(0),
    debt: z.number().min(0),
    isStartup: z.boolean(),
    projectedRevenueYear1: z.number().optional(),
    projectedEbitdaYear1: z.number().optional()
});

type FormData = z.infer<typeof schema>;

export default function StepFinancials() {
    const { data, updateData, setStep, saveDraft, isSaving } = useWizard();
    const t = useTranslations('Wizard');
    const isEarlyStage = data.role === 'idea' || data.role === 'startup';

    // Initialize 3 years of history if empty
    const currentYear = new Date().getFullYear();
    const defaultHistory = data.financials.history?.length ? data.financials.history : [
        { year: currentYear - 3, revenue: 0, ebitda: 0, netIncome: 0, cogs: 0, operatingExpenses: 0, addbacks: 0, ownerAdj: 0, oneTime: 0 },
        { year: currentYear - 2, revenue: 0, ebitda: 0, netIncome: 0, cogs: 0, operatingExpenses: 0, addbacks: 0, ownerAdj: 0, oneTime: 0 },
        { year: currentYear - 1, revenue: 0, ebitda: 0, netIncome: 0, cogs: 0, operatingExpenses: 0, addbacks: 0, ownerAdj: 0, oneTime: 0 }
    ];

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            history: defaultHistory,
            cash: data.financials.cash || 0,
            debt: data.financials.debt || 0,
            isStartup: isEarlyStage,
            projectedRevenueYear1: data.financials.projectedRevenueYear1 || 0
        }
    });

    const { fields } = useFieldArray({
        control,
        name: "history"
    });

    // Determine if we should show full history input or just startup mode
    const watchedIsStartup = watch('isStartup');

    // STARTUP MODE STATE
    const [avgPrice, setAvgPrice] = React.useState(0);
    const [projectedCustomers, setProjectedCustomers] = React.useState(0);
    const [monthlyCost, setMonthlyCost] = React.useState(0);

    // Auto-calculate projected revenue (Average * Customers * 12) AND EBITDA
    useEffect(() => {
        if (isEarlyStage || watchedIsStartup) {
            const annualRevenue = avgPrice * projectedCustomers * 12;
            const annualCost = monthlyCost * 12;
            const projectedEbitda = annualRevenue - annualCost;

            if (annualRevenue > 0) {
                setValue('projectedRevenueYear1', annualRevenue);
            }
            // Update EBITDA (can be negative)
            setValue('projectedEbitdaYear1', projectedEbitda);
        }
    }, [avgPrice, projectedCustomers, monthlyCost, setValue, isEarlyStage, watchedIsStartup]);

    const onSubmit = (formData: any) => {
        // Calculate Growth Rate based on history or projection
        let growthRate = 0;
        if (!formData.isStartup && formData.history && formData.history.length >= 2) {
            const start = formData.history[0].revenue;
            const end = formData.history[formData.history.length - 1].revenue;
            if (start > 0) {
                growthRate = Math.pow(end / start, 1 / (formData.history.length - 1)) - 1;
            }
        }

        // Populate "Legacy" fields with latest year data for backward compatibility
        const lastYear = formData.history[formData.history.length - 1];

        updateData({
            financials: {
                ...formData,
                revenue: lastYear.revenue,
                ebitda: lastYear.ebitda,
                netIncome: lastYear.netIncome,
                cogs: lastYear.cogs,
                operatingExpenses: lastYear.operatingExpenses,
                growthRate
            }
        });
        setStep('qualitative');
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('financials.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('financials.subtitle')}
                </p>
                {/* Mode Toggle */}
                <div className="mt-4 flex items-center gap-2">
                    <input type="checkbox" id="isStartup" {...register('isStartup')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                    <label htmlFor="isStartup" className="text-sm text-gray-700 dark:text-gray-300">
                        Minha empresa é uma Startup em estágio inicial (sem histórico relevante)
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {watchedIsStartup ? (
                    // STARTUP MODE
                    // STARTUP MODE
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900">
                        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">Projeção Inicial (Próximos 12 meses)</h3>

                        {/* Projection Calculator Helper */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Ticket Médio (Preço Médio)
                                </label>
                                <NumericFormat
                                    thousandSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale
                                    prefix="$"
                                    placeholder="Ex: 50.00"
                                    onValueChange={(v) => {
                                        setAvgPrice(v.floatValue ?? 0);
                                    }}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Clientes Projetados (por Mês)
                                </label>
                                <NumericFormat
                                    thousandSeparator=","
                                    decimalScale={0}
                                    placeholder="Ex: 100"
                                    onValueChange={(v) => {
                                        setProjectedCustomers(v.floatValue ?? 0);
                                    }}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 sm:text-sm"
                                />
                            </div>

                            <div className="md:col-span-2 border-t border-gray-200 dark:border-blue-800 pt-4 mt-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Custo Operacional Mensal Projetado
                                </label>
                                <NumericFormat
                                    thousandSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale
                                    prefix="$"
                                    placeholder="Ex: 2000.00"
                                    onValueChange={(v) => {
                                        setMonthlyCost(v.floatValue ?? 0);
                                    }}
                                    className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 sm:text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">Inclua salários, ferramentas, marketing, etc.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Receita Anual Projetada (Autom.)
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <NumericFormat
                                        value={watch('projectedRevenueYear1')}
                                        thousandSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        prefix="$"
                                        onValueChange={(v) => setValue('projectedRevenueYear1', v.floatValue ?? 0)}
                                        className="block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700 sm:text-sm"
                                        readOnly
                                    />
                                </div>
                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                    {avgPrice ? avgPrice : 0} x {projectedCustomers ? projectedCustomers : 0} x 12
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    EBITDA Projetado (Lucro Op.)
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <NumericFormat
                                        value={watch('projectedEbitdaYear1')}
                                        thousandSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        prefix="$"
                                        onValueChange={(v) => setValue('projectedEbitdaYear1', v.floatValue ?? 0)}
                                        className={`block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700 sm:text-sm ${(watch('projectedEbitdaYear1') || 0) < 0 ? 'text-red-500 font-medium' : 'text-green-600 font-medium'
                                            }`}
                                        readOnly
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Receita - (Custo Mensal x 12)
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ESTABLISHED BUSINESS MODE (3 Years)
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                            <thead>
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-black z-10">Item</th>
                                    {fields.map((field, index) => (
                                        <th key={field.id} className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {field.year}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                                {/* Revenue */}
                                <tr>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-black">Receita Bruta</td>
                                    {fields.map((field, index) => (
                                        <td key={field.id} className="px-2 py-2">
                                            <CurrencyInput name={`history.${index}.revenue`} control={control as any} label="" showLabel={false} />
                                        </td>
                                    ))}
                                </tr>
                                {/* COGS */}
                                <tr>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-black">CMV / Custos Variáveis</td>
                                    {fields.map((field, index) => (
                                        <td key={field.id} className="px-2 py-2">
                                            <CurrencyInput name={`history.${index}.cogs`} control={control as any} label="" showLabel={false} />
                                        </td>
                                    ))}
                                </tr>
                                {/* OpEx */}
                                <tr>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-black">Despesas Operacionais</td>
                                    {fields.map((field, index) => (
                                        <td key={field.id} className="px-2 py-2">
                                            <CurrencyInput name={`history.${index}.operatingExpenses`} control={control as any} label="" showLabel={false} />
                                        </td>
                                    ))}
                                </tr>
                                {/* EBITDA */}
                                <tr>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-black">EBITDA (Original)</td>
                                    {fields.map((field, index) => (
                                        <td key={field.id} className="px-2 py-2">
                                            <CurrencyInput name={`history.${index}.ebitda`} control={control as any} label="" showLabel={false} />
                                        </td>
                                    ))}
                                </tr>
                                {/* SEPARATOR */}
                                <tr>
                                    <td colSpan={4} className="px-3 py-4 text-xs font-bold text-gray-500 bg-gray-50 dark:bg-zinc-800">NORMALIZAÇÃO (AJUSTES)</td>
                                </tr>
                                {/* Addbacks */}
                                <tr>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-black">
                                        (+) Despesas Pessoais / Addbacks
                                        <span className="block text-xs text-gray-500">Ex: Carro pessoal, viagens</span>
                                    </td>
                                    {fields.map((field, index) => (
                                        <td key={field.id} className="px-2 py-2">
                                            <CurrencyInput name={`history.${index}.addbacks`} control={control as any} label="" showLabel={false} />
                                        </td>
                                    ))}
                                </tr>
                                {/* Owner Adj */}
                                <tr>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-black">
                                        (-) Ajuste Salário Dono
                                        <span className="block text-xs text-gray-500">Diferença para Salário de Mercado</span>
                                    </td>
                                    {fields.map((field, index) => (
                                        <td key={field.id} className="px-2 py-2">
                                            <CurrencyInput name={`history.${index}.ownerAdj`} control={control as any} label="" showLabel={false} />
                                        </td>
                                    ))}
                                </tr>
                                {/* OneTime */}
                                <tr>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-black">
                                        (-) Eventos Extraordinários
                                        <span className="block text-xs text-gray-500">Ex: Indenizações, desastres</span>
                                    </td>
                                    {fields.map((field, index) => (
                                        <td key={field.id} className="px-2 py-2">
                                            <CurrencyInput name={`history.${index}.oneTime`} control={control as any} label="" showLabel={false} />
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* BALANCE SHEET SECTION */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Balanço Patrimonial Simplificado</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CurrencyInput
                            name="cash"
                            control={control as any}
                            label="Caixa Disponível e Equivalentes"
                        />
                        <CurrencyInput
                            name="debt"
                            control={control as any}
                            label="Dívida Total (Empréstimos de Longo Prazo)"
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep('identification')}>
                        {t('buttons.back')}
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={saveDraft} disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                        </Button>
                        <Button type="submit">
                            {t('buttons.next')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
