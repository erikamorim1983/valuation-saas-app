import { createClient } from '@/lib/supabase/client';
import { showError } from '@/lib/toast';

export type Company = {
    id: string;
    user_id: string;
    name: string;
    industry: string;
    sub_industry: string;
    founding_year: number;
    website: string;
    description: string;
    created_at: string;
};

export async function getUserCompany() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch the single company allowed for this user
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error('[getUserCompany] Error:', error);
        showError('Failed to load company data');
        return null;
    }

    return data as Company | null;
}

export async function createUserCompany(companyData: Omit<Company, 'id' | 'user_id' | 'created_at'>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('[createUserCompany] User not authenticated');
        showError('You must be logged in to register a company');
        throw new Error('User not authenticated');
    }

    // Security check: ensure user doesn't already have a company
    const existing = await getUserCompany();
    if (existing) {
        showError('You already have a registered company. Upgrade your plan to add more.');
        throw new Error('User already has a company registered. Upgrade plan to add more.');
    }

    const { data, error } = await supabase
        .from('companies')
        .insert({
            user_id: user.id,
            ...companyData
        })
        .select()
        .single();

    if (error) {
        console.error('[createUserCompany] Error:', error);
        console.error('[createUserCompany] Error code:', error.code);
        console.error('[createUserCompany] Error message:', error.message);
        console.error('[createUserCompany] Error details:', error.details);
        console.error('[createUserCompany] Error hint:', error.hint);
        console.error('[createUserCompany] Full error object:', JSON.stringify(error, null, 2));
        
        // More specific error messages
        if (error.code === '23505') {
            showError('Você já tem uma empresa cadastrada. Faça upgrade para adicionar mais.');
        } else if (error.code === '42501') {
            showError('Erro de permissão. Por favor, faça login novamente.');
        } else if (error.message?.includes('policy')) {
            showError('Erro de política de segurança. Verifique suas permissões.');
        } else {
            showError('Erro ao criar empresa. Por favor, tente novamente.');
        }
        throw error;
    }

    return data as Company;
}
