'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createUserProfile } from '@/lib/supabase/userProfile';
import { createUserCompany } from '@/lib/supabase/company';
import { Button } from '@/components/ui/Button';

// Sectors Data
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

export default function BusinessOwnerOnboardingPage() {
    const router = useRouter();
    const t = useTranslations('BusinessOwnerOnboarding');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'profile' | 'company'>('profile');

    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: ''
    });

    const [companyData, setCompanyData] = useState({
        name: '',
        website: '',
        industry: 'SaaS',
        sub_industry: 'B2B',
        founding_year: new Date().getFullYear(),
        description: ''
    });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setCompanyData({ ...companyData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('company');
    };

    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create user profile
            await createUserProfile({
                user_type: 'business_owner',
                full_name: profileData.full_name,
                phone: profileData.phone || undefined
            });

            // Create company
            await createUserCompany({
                name: companyData.name,
                website: companyData.website,
                industry: companyData.industry,
                sub_industry: companyData.sub_industry,
                founding_year: Number(companyData.founding_year),
                description: companyData.description
            });

            // Redirect to dashboard
            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            alert('Erro ao criar perfil e empresa. Tente novamente.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'profile') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 py-12 px-4">
                <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-black p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
                    <div>
                        <div className="text-6xl text-center mb-4">🏢</div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                            {t('profileTitle')}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            {t('profileSubtitle')}
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleProfileSubmit}>
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
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    placeholder="Seu nome completo"
                                    value={profileData.full_name}
                                    onChange={handleProfileChange}
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
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    placeholder="+55 (11) 99999-9999"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                />
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
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {t('next')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 py-12 px-4">
            <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-black p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
                <div>
                    <div className="text-6xl text-center mb-4">🏢</div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        {t('companyTitle')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {t('companySubtitle')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleCompanySubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nome da Empresa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    value={companyData.name}
                                    onChange={handleCompanyChange}
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
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    placeholder="https://"
                                    value={companyData.website}
                                    onChange={handleCompanyChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                O que a empresa faz? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                value={companyData.description}
                                onChange={handleCompanyChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="founding_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ano de Fundação <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="founding_year"
                                    name="founding_year"
                                    type="number"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    value={companyData.founding_year}
                                    onChange={handleCompanyChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Setor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="industry"
                                    name="industry"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    value={companyData.industry}
                                    onChange={handleCompanyChange}
                                >
                                    {Object.keys(SECTORS).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="sub_industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sub-Setor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="sub_industry"
                                    name="sub_industry"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
                                    value={companyData.sub_industry}
                                    onChange={handleCompanyChange}
                                >
                                    {SECTORS[companyData.industry as keyof typeof SECTORS]?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('profile')}
                            className="flex-1"
                        >
                            {t('back')}
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? t('creating') : t('complete')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
