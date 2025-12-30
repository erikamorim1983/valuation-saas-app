import { createClient } from '@/lib/supabase/client';

export type UserType = 'consultant' | 'business_owner';

export type UserProfile = {
    id: string;
    user_id: string;
    user_type: UserType;
    full_name: string;
    phone?: string;
    company_name?: string;
    specialization?: string;
    professional_id?: string;
    created_at: string;
    updated_at: string;
    onboarding_completed: boolean;
};

export type CreateUserProfileData = {
    user_type: UserType;
    full_name: string;
    phone?: string;
    company_name?: string;
    specialization?: string;
    professional_id?: string;
};

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return data as UserProfile | null;
}

/**
 * Create a new user profile
 */
export async function createUserProfile(profileData: CreateUserProfileData): Promise<UserProfile> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // Check if profile already exists
    const existing = await getUserProfile();
    if (existing) {
        throw new Error('User profile already exists');
    }

    const { data, error } = await supabase
        .from('user_profiles')
        .insert({
            user_id: user.id,
            ...profileData,
            onboarding_completed: false
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }

    return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<CreateUserProfileData>): Promise<UserProfile> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }

    return data as UserProfile;
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding(): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error completing onboarding:', error);
        throw error;
    }
}

/**
 * Check if user is a consultant
 */
export async function isConsultant(): Promise<boolean> {
    const profile = await getUserProfile();
    return profile?.user_type === 'consultant';
}

/**
 * Check if user is a business owner
 */
export async function isBusinessOwner(): Promise<boolean> {
    const profile = await getUserProfile();
    return profile?.user_type === 'business_owner';
}
