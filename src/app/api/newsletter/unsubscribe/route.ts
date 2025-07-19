import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email && !token) {
      return NextResponse.json(
        { success: false, error: 'Email or unsubscribe token is required' },
        { status: 400 }
      );
    }

    // Create admin client for newsletter operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find subscriber by email or token
    let query = supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, status');

    if (token) {
      query = query.eq('unsubscribe_token', token);
    } else {
      query = query.eq('email', email);
    }

    const { data: subscriber, error: findError } = await query.single();

    if (findError || !subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        success: true,
        message: 'Already unsubscribed from newsletter',
        data: { email: subscriber.email, alreadyUnsubscribed: true }
      });
    }

    // Unsubscribe the user
    const { error: updateError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Error unsubscribing user:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    console.log('User unsubscribed from newsletter:', subscriber.email);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: { email: subscriber.email, unsubscribed: true }
    });

  } catch (error) {
    console.error('Error in newsletter unsubscribe API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for one-click unsubscribe links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    // Create admin client for newsletter operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, status')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !subscriber) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe - Ashhadu Islamic Art</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Unsubscribe Error</h1>
          <p class="error">Invalid unsubscribe link. Please contact support if you continue to receive emails.</p>
          <a href="https://ashhadu.co.uk">Return to Ashhadu Islamic Art</a>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 404
      });
    }

    if (subscriber.status === 'unsubscribed') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Unsubscribed - Ashhadu Islamic Art</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #059669; }
          </style>
        </head>
        <body>
          <h1>Already Unsubscribed</h1>
          <p class="success">You have already been unsubscribed from our newsletter.</p>
          <a href="https://ashhadu.co.uk">Return to Ashhadu Islamic Art</a>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Unsubscribe the user
    const { error: updateError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Error unsubscribing user:', updateError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe Error - Ashhadu Islamic Art</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Unsubscribe Error</h1>
          <p class="error">Failed to process unsubscribe request. Please try again or contact support.</p>
          <a href="https://ashhadu.co.uk">Return to Ashhadu Islamic Art</a>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 500
      });
    }

    console.log('User unsubscribed from newsletter via link:', subscriber.email);

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - Ashhadu Islamic Art</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .success { color: #059669; }
          .logo { max-width: 200px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Successfully Unsubscribed</h1>
        <p class="success">You have been successfully unsubscribed from the Ashhadu Islamic Art newsletter.</p>
        <p>We're sorry to see you go! If you change your mind, you can subscribe again on our website.</p>
        <p><a href="https://ashhadu.co.uk">Return to Ashhadu Islamic Art</a></p>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error in newsletter unsubscribe GET:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Error - Ashhadu Islamic Art</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>Unsubscribe Error</h1>
        <p class="error">An error occurred while processing your unsubscribe request.</p>
        <a href="https://ashhadu.co.uk">Return to Ashhadu Islamic Art</a>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 500
    });
  }
}