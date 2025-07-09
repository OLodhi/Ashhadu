import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession, createAuthResponse, createUserProfile, createServerSupabaseClient } from '@/lib/auth-utils-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile API: Starting profile validation...');
    
    // Debug: Check what auth context we have
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 Profile API: Session check:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      error: sessionError?.message 
    });
    
    // Validate user session
    const validationResult = await validateUserSession();
    
    if (!validationResult.isValid) {
      console.log('❌ Profile API: Session validation failed:', validationResult.error);
      return createAuthResponse(false, null, 'Authentication required', 401);
    }

    console.log('✅ Profile API: Session validated successfully');
    
    // If profile doesn't exist, create it
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