import { createClient } from '@/lib/supabase/client';
import { showError } from '@/lib/toast';

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
    full_name?: string;
    phone?: string;
    company_name?: string;
    specialization?: string;
    professional_id?: string;
    onboarding_completed?: boolean;
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
        console.error('[getUserProfile] Error:', error);
        showError('Failed to load profile data');
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

    if (!user) {
        console.error('[createUserProfile] User not authenticated');
        showError('You must be logged in to create a profile');
        throw new Error('User not authenticated');
    }

    // Check if profile already exists
    const existing = await getUserProfile();
    if (existing) {
        showError('Profile already exists for this user');
        throw new Error('User profile already exists');
    }

    const { data, error } = await supabase
        .from('user_profiles')
        .insert({
            user_id: user.id,
            ...profileData,
            onboarding_completed: profileData.onboarding_completed ?? false
        })
        .select()
        .single();

    if (error) {
        console.error('[createUserProfile] Error:', error);
        console.error('[createUserProfile] Full details:', JSON.stringify(error, null, 2));
        showError('Failed to create profile. Please try again.');
        throw error;
    }

    return data as UserProfile;
}

export type UpdateUserProfileData = Partial<CreateUserProfileData> & {
    onboarding_completed?: boolean;
};

/**
 * Update user profile
 */
export async function updateUserProfile(updates: UpdateUserProfileData): Promise<UserProfile> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('[updateUserProfile] User not authenticated');
        showError('You must be logged in to update your profile');
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('[updateUserProfile] Error:', error);
        console.error('[updateUserProfile] Full details:', JSON.stringify(error, null, 2));
        showError('Failed to update profile. Please try again.');
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

    if (!user) {
        console.error('[completeOnboarding] User not authenticated');
        showError('You must be logged in');
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

    if (error) {
        console.error('[completeOnboarding] Error:', error);
        showError('Failed to complete onboarding. Please try again.');
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
