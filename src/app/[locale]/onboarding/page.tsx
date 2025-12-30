'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createUserCompany } from '@/lib/supabase/company';
import { Button } from '@/components/ui/Button';

// Sectors Data (Duplicated from StepIdentification for now to keep pages independent)
const SECTORS = {
    'SaaS': ['B2B', 'B2C', 'Enterprise', 'Micro-SaaS', 'Vertical SaaS', 'AI_Wrapper'],
    'E-commerce': ['D2C_Brand', 'Dropshipping', 'Marketplace', 'Digital_Products', 'Subscription_Box'],
    'Service': ['Marketing_Agency', 'Dev_Shop', 'Consulting', 'Legal', 'Accounting', 'Cleaning', 'Beauty_Wellness', 'Gym_Fitness'],
    'Fintech': ['Payments', 'Lending', 'Personal_Finance', 'Crypto_Web3', 'Insurtech'],
    'Edtech': ['LMS', 'Course_Creator', 'Coaching', 'Corporate_Training', 'School_University'],
    'Retail': ['Supermarket', 'Fashion', 'Electronics', 'Furniture', 'Convenience_Store', 'Pharmacy'],
    'Food_Beverage': ['Restaurant', 'Cafe_Bakery', 'Bar_Nightclub', 'Food_Truck', 'Catering', 'Ghost_Kitchen'],
    'Construction': ['General_Contractor', 'Renovation', 'Architecture_Design', 'Real_Estate_Dev', 'Materials_Supply'],
    'Automotive': ['Dealership', 'Repair_Shop', 'Rental', 'Auto_Parts', 'Car_Wash'],
    'Health': ['Medical_Clinic', 'Dental_Clinic', 'Hospital', 'Physiotherapy', 'Lab'],
    'Manufacturing': ['Food_Processing', 'Textile', 'Electronics_Mfg', 'Industrial_Equip', 'Consumer_Goods'],
    'Logistics': ['Trucking', 'Warehousing', 'Last_Mile', 'Freight_Forwarding'],
    'Other': ['Gig_Economy', 'Non_Profit', 'Agriculture', 'Entertainment']
};

export default function OnboardingPage() {
    const t = useTranslations('Wizard'); // Use Wizard namespace for consistency
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        industry: 'SaaS',
        sub_industry: 'B2B',
        founding_year: new Date().getFullYear(),
        description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Sub-sector logic
    useEffect(() => {
        const subs = SECTORS[formData.industry as keyof typeof SECTORS];
        if (subs && !subs.includes(formData.sub_industry)) {
            setFormData(prev => ({ ...prev, sub_industry: subs[0] }));
        } else if (formData.industry === 'Other') {
            // Keep distinct if needed, or clear
        }
    }, [formData.industry]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createUserCompany({
                name: formData.name,
                website: formData.website,
                industry: formData.industry,
                sub_industry: formData.sub_industry,
                founding_year: Number(formData.founding_year),
                description: formData.description
            });

            // Redirect to Dashboard after successful creation
            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            alert('Error creating company. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-black p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Cadastro da Empresa
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Defina o perfil da sua empresa. Esses dados serão usados em todos os seus valuations.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nome da Empresa
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    placeholder="Ex: Minha SaaS Ltda"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Site (URL)
                                </label>
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    placeholder="https://"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                O que a empresa faz? (Descrição)
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                placeholder="Descreva seu modelo de negócio, público alvo e diferencial..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="founding_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ano de Fundação
                                </label>
                                <input
                                    id="founding_year"
                                    name="founding_year"
                                    type="number"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    value={formData.founding_year}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Sector Select */}
                            <div>
                                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Setor
                                </label>
                                <select
                                    id="industry"
                                    name="industry"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    value={formData.industry}
                                    onChange={handleChange}
                                >
                                    {Object.keys(SECTORS).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sub-Sector Select */}
                            <div>
                                <label htmlFor="sub_industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sub-Setor / Nicho
                                </label>
                                {formData.industry === 'Other' ? (
                                    <input
                                        id="sub_industry"
                                        name="sub_industry"
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                        value={formData.sub_industry}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <select
                                        id="sub_industry"
                                        name="sub_industry"
                                        disabled={!formData.industry}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm disabled:opacity-50"
                                        value={formData.sub_industry}
                                        onChange={handleChange}
                                    >
                                        {SECTORS[formData.industry as keyof typeof SECTORS]?.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full justify-center"
                            disabled={loading}
                        >
                            {loading ? 'Gravando Perfil...' : 'Confirmar e Ir para Dashboard'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
