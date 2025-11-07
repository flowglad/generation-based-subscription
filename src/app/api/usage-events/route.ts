import { flowgladServer } from '@/lib/flowglad';
import { NextResponse } from 'next/server';

/**
 * POST /api/usage-events
 * Creates a usage event for the current customer
 * 
 * Body: {
 *   usageMeterSlug: string;  // e.g., 'fast_generations'
 *   amount: number;          // e.g., 1
 *   transactionId?: string; // Optional: for idempotency
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usageMeterSlug, amount, transactionId } = body;

    if (!usageMeterSlug || amount === undefined) {
      return NextResponse.json(
        { error: 'usageMeterSlug and amount are required' },
        { status: 400 }
      );
    }

    // Get billing information to extract required IDs
    const billing = await flowgladServer.getBilling();
    
    if (!billing.customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Find the current subscription
    const currentSubscription = billing.currentSubscriptions?.[0];
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const subscriptionId = currentSubscription.id;

    // Find the usage meter from the catalog
    const usageMeter = billing.catalog?.usageMeters?.find(
      (meter) => 'slug' in meter && meter.slug === usageMeterSlug
    );

    if (!usageMeter) {
      return NextResponse.json(
        { 
          error: `Usage meter not found: ${usageMeterSlug}`,
        },
        { status: 404 }
      );
    }

    const usageMeterId = usageMeter.id;

    // Find usage price that matches this usage meter
    const usagePrice = billing.catalog?.products
      ?.flatMap((product) => product.prices || [])
      .find(
        (price) => price.type === 'usage' && price.usageMeterId === usageMeterId
      );

    if (!usagePrice) {
      return NextResponse.json(
        { 
          error: `Usage price not found for meter: ${usageMeterSlug}. A usage-type price is required to create usage events.`,
        },
        { status: 404 }
      );
    }

    const priceId = usagePrice.id;

    // Create usage event with all required IDs
    // Note: customerId is automatically resolved from the session by FlowgladServer
    const usageEvent = await flowgladServer.createUsageEvent({
      subscriptionId,
      priceId,
      usageMeterId,
      amount,
      transactionId: transactionId || `usage_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    });

    return NextResponse.json({ 
      success: true, 
      usageEvent 
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create usage event' 
      },
      { status: 500 }
    );
  }
}

