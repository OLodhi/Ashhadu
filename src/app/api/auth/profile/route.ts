import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession, createAuthResponse, createUserProfile, createServerSupabaseClient } from '@/lib/auth-utils-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile API: Starting profile validation...');
    
    // Validate user session (now supports impersonation)
    const validationResult = await validateUserSession();
    
    console.log('🔍 Profile API: Validation result:', {
      isValid: validationResult.isValid,
      hasProfile: !!validationResult.profile,
      hasCustomer: !!validationResult.customer,
      userRole: validationResult.profile?.role,
      error: validationResult.error
    });
    
    if (!validationResult.isValid) {
      console.log('❌ Profile API: Session validation failed:', validationResult.error);
      return createAuthResponse(false, null, 'Authentication required', 401);
    }

    console.log('✅ Profile API: Session validated successfully');
    
    // For impersonation sessions, we already have complete customer data
    if (validationResult.profile && validationResult.customer) {
      console.log('✅ Profile API: Returning complete user data (including impersonation)');
      return createAuthResponse(true, {
        profile: validationResult.profile,
        customer: validationResult.customer,
        user: validationResult.session!.user,
        isImpersonating: validationResult.session?.access_token === 'impersonation_token'
      });
    }
    
    // If profile doesn't exist, create it (this is for regular authentication)
    if (!validationResult.profile) {
      console.log('🔄 Profile API: Profile not found, creating new profile...');
      const createResult = await createUserProfile(validationResult.session!.user);
      
      if (!createResult.success) {
        console.error('❌ Profile API: Failed to create profile:', createResult.error);
        return createAuthResponse(false, null, 'Failed to create profile', 500);
      }
      
      console.log('✅ Profile API: Profile created successfully');
      
      // Re-validate to get the newly created profile
      const retryResult = await validateUserSession();
      if (retryResult.isValid && retryResult.profile) {
        return createAuthResponse(true, {
          profile: retryResult.profile,
          customer: retryResult.customer,
          user: retryResult.session!.user,
          created: true
        });
      }
    }

    return createAuthResponse(true, {
      profile: validationResult.profile,
      customer: validationResult.customer,
      user: validationResult.session!.user
    });

  } catch (error) {
    console.error('❌ Profile API: Unexpected error:', error);
    return createAuthResponse(false, null, 'Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Profile API: Starting profile update...');
    
    // Validate user session
    const validationResult = await validateUserSession();
    
    if (!validationResult.isValid) {
      console.log('❌ Profile API: Session validation failed:', validationResult.error);
      return createAuthResponse(false, null, 'Authentication required', 401);
    }

    // Get request body
    const updates = await request.json();
    console.log('📝 Profile API: Updating profile with:', updates);
    
    // Validate required fields
    if (!validationResult.profile) {
      return createAuthResponse(false, null, 'Profile not found', 404);
    }

    // TODO: Add validation for allowed fields
    // Update profile
    const supabase = await createServerSupabaseClient();
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', validationResult.session!.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Profile API: Update failed:', updateError);
      return createAuthResponse(false, null, 'Failed to update profile', 500);
    }

    console.log('✅ Profile API: Profile updated successfully');
    return createAuthResponse(true, {
      profile: updatedProfile,
      updated: true
    });

  } catch (error) {
    console.error('❌ Profile API: Unexpected error:', error);
    return createAuthResponse(false, null, 'Internal server error', 500);
  }
}