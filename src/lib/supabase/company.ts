import { createClient } from '@/lib/supabase/client';

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
        console.error('Error fetching company:', error);
        return null;
    }

    return data as Company | null;
}

export async function createUserCompany(companyData: Omit<Company, 'id' | 'user_id' | 'created_at'>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // Security check: ensure user doesn't already have a company
    const existing = await getUserCompany();
    if (existing) {
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
        console.error('Error creating company:', error);
        throw error;
    }

    return data as Company;
}
