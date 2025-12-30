import { createClient } from '@/lib/supabase/client';
import { FinancialData, ValuationResult, ValuationParams } from '@/lib/valuation/types';

export type ValuationStatus = 'draft' | 'completed';

export interface ValuationRecord {
    id: string;
    user_id: string;
    company_name: string;
    sector: string;
    currency: string;
    financial_data: FinancialData;
    valuation_result: ValuationResult | null;
    status: ValuationStatus;
    created_at: string;
    updated_at: string;
}

export async function getValuation(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('valuations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as ValuationRecord;
}

export async function createValuation(data: Partial<ValuationRecord>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data: newValuation, error } = await supabase
        .from('valuations')
        .insert({
            user_id: user.id,
            company_name: data.company_name,
            sector: data.sector,
            currency: data.currency,
            financial_data: data.financial_data,
            valuation_result: data.valuation_result,
            status: data.status || 'draft'
        })
        .select()
        .single();

    if (error) throw error;
    return newValuation as ValuationRecord;
}

export async function updateValuation(id: string, data: Partial<ValuationRecord>) {
    const supabase = createClient();
    const { data: updatedValuation, error } = await supabase
        .from('valuations')
        .update({
            company_name: data.company_name,
            sector: data.sector,
            currency: data.currency,
            financial_data: data.financial_data,
            valuation_result: data.valuation_result,
            status: data.status
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return updatedValuation as ValuationRecord;
}

export async function getUserValuations() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('valuations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching valuations:', error);
        return [];
    }

    return data as ValuationRecord[];
}
