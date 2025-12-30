import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Helper function to verify Polar webhook signature (Standard Webhooks spec)
async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string | undefined
): Promise<boolean> {
  if (!secret || !signature) {
    // If no secret is configured, skip verification (development mode)
    console.warn("Webhook signature verification skipped - no secret configured");
    return true;
  }

  try {
    // Standard Webhooks format: "t=timestamp,v1=signature"
    const parts = signature.split(",");
    const timestampPart = parts.find(p => p.startsWith("t="));
    const signaturePart = parts.find(p => p.startsWith("v1="));

    if (!timestampPart || !signaturePart) {
      console.error("Invalid signature format");
      return false;
    }

    const timestamp = timestampPart.substring(2);
    const expectedSignature = signaturePart.substring(3);

    // Create the signed payload (timestamp.payload)
    const signedPayload = `${timestamp}.${payload}`;

    // Compute HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex
    const computedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Compare signatures
    return computedSignature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Polar webhook endpoint
http.route({
  path: "/polar-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get raw body for signature verification
      const rawBody = await request.text();
      const signature = request.headers.get("webhook-signature") || request.headers.get("polar-signature");
      const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

      // Verify webhook signature
      const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Parse the body after verification
      const body = JSON.parse(rawBody);
      const eventType = body.type || body.event;
      
      console.log("Polar webhook received:", eventType);
      
      // Handle different Polar webhook events
      switch (eventType) {
        case "checkout.created":
        case "checkout.updated":
          // Checkout in progress, no action needed
          console.log("Checkout in progress");
          break;
        
        case "checkout.completed":
          // Checkout completed - might contain subscription info
          await handleCheckoutCompleted(ctx, body);
          break;
          
        case "subscription.created":
        case "subscription.updated":
        case "subscription.active":
          // Subscription is active
          await handleSubscriptionActive(ctx, body);
          break;
          
        case "subscription.canceled":
        case "subscription.revoked":
          // Subscription was canceled
          await handleSubscriptionCanceled(ctx, body);
          break;
          
        case "order.created":
          // Order created - activate subscription
          await handleOrderCreated(ctx, body);
          break;
          
        case "customer.state_changed":
          // Customer state changed - check for active subscription
          await handleCustomerStateChanged(ctx, body);
          break;

        default:
          console.log("Unhandled Polar webhook event:", eventType, JSON.stringify(body, null, 2));
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Polar webhook error:", error);
      return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

async function handleCheckoutCompleted(ctx: any, body: any) {
  const checkout = body.data;
  const customerEmail = checkout?.customer_email || checkout?.customer?.email || checkout?.email;
  const customerId = checkout?.customer_id || checkout?.customer?.id;
  
  console.log("Checkout completed for:", customerEmail);
  
  if (customerEmail) {
    // Activate subscription immediately on checkout completion
    await ctx.runMutation(api.auth.updateSubscriptionByEmail, {
      email: customerEmail.toLowerCase(),
      subscriptionStatus: "active",
      polarCustomerId: customerId,
      subscriptionExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days default
    });
  }
}

async function handleOrderCreated(ctx: any, body: any) {
  const order = body.data;
  const customerEmail = order?.customer?.email || order?.user?.email || order?.customer_email;
  const customerId = order?.customer?.id || order?.customer_id;
  
  console.log("Order created for:", customerEmail);
  
  if (customerEmail) {
    // Activate subscription on order creation
    const expiresAt = order?.subscription?.current_period_end
      ? new Date(order.subscription.current_period_end).getTime()
      : Date.now() + 30 * 24 * 60 * 60 * 1000;
      
    await ctx.runMutation(api.auth.updateSubscriptionByEmail, {
      email: customerEmail.toLowerCase(),
      subscriptionStatus: "active",
      polarCustomerId: customerId,
      subscriptionExpiresAt: expiresAt,
    });
  }
}

async function handleSubscriptionActive(ctx: any, body: any) {
  const subscription = body.data;
  const customerEmail = subscription?.customer?.email || subscription?.user?.email || subscription?.customer_email;
  const customerId = subscription?.customer?.id || subscription?.customer_id;
  const status = subscription?.status || "active";
  
  // Calculate expiration (current period end or default to 30 days)
  const currentPeriodEnd = subscription?.current_period_end;
  const expiresAt = currentPeriodEnd 
    ? new Date(currentPeriodEnd).getTime()
    : Date.now() + 30 * 24 * 60 * 60 * 1000;
  
  if (customerEmail) {
    await ctx.runMutation(api.auth.updateSubscriptionByEmail, {
      email: customerEmail.toLowerCase(),
      subscriptionStatus: status === "trialing" ? "trialing" : "active",
      polarCustomerId: customerId,
      subscriptionExpiresAt: expiresAt,
    });
  }
}

async function handleSubscriptionCanceled(ctx: any, body: any) {
  const subscription = body.data;
  const customerEmail = subscription?.customer?.email || subscription?.user?.email || subscription?.customer_email;
  const customerId = subscription?.customer?.id || subscription?.customer_id;
  
  if (customerEmail) {
    await ctx.runMutation(api.auth.updateSubscriptionByEmail, {
      email: customerEmail.toLowerCase(),
      subscriptionStatus: "canceled",
      polarCustomerId: customerId,
      subscriptionExpiresAt: Date.now(), // Immediate expiration
    });
  }
}

async function handleCustomerStateChanged(ctx: any, body: any) {
  const data = body.data;
  const customerEmail = data?.customer?.email;
  const customerId = data?.customer?.id;
  const subscriptions = data?.subscriptions || [];
  
  // Check if customer has any active subscription
  const activeSubscription = subscriptions.find(
    (sub: any) => sub.status === "active" || sub.status === "trialing"
  );
  
  if (customerEmail) {
    if (activeSubscription) {
      const expiresAt = activeSubscription.current_period_end
        ? new Date(activeSubscription.current_period_end).getTime()
        : Date.now() + 30 * 24 * 60 * 60 * 1000;
        
      await ctx.runMutation(api.auth.updateSubscriptionByEmail, {
        email: customerEmail.toLowerCase(),
        subscriptionStatus: activeSubscription.status === "trialing" ? "trialing" : "active",
        polarCustomerId: customerId,
        subscriptionExpiresAt: expiresAt,
      });
    } else {
      await ctx.runMutation(api.auth.updateSubscriptionByEmail, {
        email: customerEmail.toLowerCase(),
        subscriptionStatus: "canceled",
        polarCustomerId: customerId,
        subscriptionExpiresAt: Date.now(),
      });
    }
  }
}

export default http;
