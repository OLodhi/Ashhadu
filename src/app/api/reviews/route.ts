import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch approved reviews with product information
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        customer_name,
        customer_email,
        rating,
        title,
        comment,
        verified_purchase,
        created_at,
        customer_id,
        products!inner (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Format reviews for testimonials section
    const formattedReviews = reviews?.map(review => ({
      id: review.id,
      name: review.customer_name,
      email: review.customer_email,
      rating: review.rating,
      title: review.title,
      text: review.comment,
      product: review.products?.name || 'Unknown Product',
      productId: review.products?.id,
      productSlug: review.products?.slug,
      verified: review.verified_purchase,
      createdAt: review.created_at,
      customerId: review.customer_id,
      // Generate location from email domain or use default
      location: generateLocationFromEmail(review.customer_email),
      // Format date for display
      relativeDate: formatRelativeDate(review.created_at)
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedReviews
    });

  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate location from email or use UK defaults
function generateLocationFromEmail(email: string): string {
  const ukCities = [
    'London, UK',
    'Manchester, UK', 
    'Birmingham, UK',
    'Leeds, UK',
    'Glasgow, UK',
    'Sheffield, UK',
    'Bradford, UK',
    'Liverpool, UK',
    'Edinburgh, UK',
    'Leicester, UK',
    'Coventry, UK',
    'Cardiff, UK',
    'Belfast, UK',
    'Nottingham, UK',
    'Hull, UK',
    'Newcastle, UK',
    'Stoke-on-Trent, UK',
    'Southampton, UK',
    'Derby, UK',
    'Portsmouth, UK'
  ];

  // Generate a consistent location based on email hash
  const emailHash = email.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(emailHash) % ukCities.length;
  return ukCities[index];
}

// Helper function to format relative dates
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInWeeks === 1) {
    return '1 week ago';
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  } else if (diffInMonths === 1) {
    return '1 month ago';
  } else if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  } else if (diffInYears === 1) {
    return '1 year ago';
  } else {
    return `${diffInYears} years ago`;
  }
}