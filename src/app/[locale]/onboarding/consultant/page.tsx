'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createUserProfile } from '@/lib/supabase/userProfile';
import { Button } from '@/components/ui/Button';

export default function ConsultantOnboardingPage() {
    const router = useRouter();
    const t = useTranslations('ConsultantOnboarding');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        company_name: '',
        specialization: 'Valuation',
        professional_id: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createUserProfile({
                user_type: 'consultant',
                full_name: formData.full_name,
                phone: formData.phone || undefined,
                company_name: formData.company_name || undefined,
                specialization: formData.specialization || undefined,
                professional_id: formData.professional_id || undefined
            });

            // Redirect to dashboard
            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            alert('Erro ao criar perfil. Tente novamente.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-black p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
                <div>
                    <div className="text-6xl text-center mb-4">👔</div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        {t('title')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {t('subtitle')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('fullName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                placeholder="Seu nome completo"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('phone')}
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                placeholder="+55 (11) 99999-9999"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('companyName')}
                            </label>
                            <input
                                id="company_name"
                                name="company_name"
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                placeholder="Nome da sua consultoria ou empresa"
                                value={formData.company_name}
                                onChange={handleChange}
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('companyNameHint')}</p>
                        </div>

                        <div>
                            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('specialization')}
                            </label>
                            <select
                                id="specialization"
                                name="specialization"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                value={formData.specialization}
                                onChange={handleChange}
                            >
                                <option value="Valuation">Valuation</option>
                                <option value="M&A">Fusões e Aquisições (M&A)</option>
                                <option value="Business_Strategy">Estratégia de Negócios</option>
                                <option value="Financial_Advisory">Assessoria Financeira</option>
                                <option value="Tax_Planning">Planejamento Tributário</option>
                                <option value="Accounting">Contabilidade</option>
                                <option value="Business_Consulting">Consultoria Empresarial</option>
                                <option value="Other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="professional_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('professionalId')}
                            </label>
                            <input
                                id="professional_id"
                                name="professional_id"
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                placeholder="CNPJ, CRC, CPA, etc."
                                value={formData.professional_id}
                                onChange={handleChange}
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('professionalIdHint')}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1"
                        >
                            {t('back')}
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? t('creating') : t('continue')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
