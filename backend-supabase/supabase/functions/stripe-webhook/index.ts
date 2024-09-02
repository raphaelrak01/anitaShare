import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "npm:stripe";

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    }
  );
  const stripe = Stripe(Deno.env.get("STRIPE_API_KEY"), {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get("Stripe-Signature") ?? "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

  const rawBody = await req.text();

  let stripeEvent;
  let orderId;

  try {
    stripeEvent = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    );

    orderId = stripeEvent.data.object.metadata.order_id;

    if (!orderId) throw new Error("No order_id in metadata");
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return new Response("Webhook signature verification failed.", {
      status: 401,
    });
  }

  let newStatus;

  switch (stripeEvent.type) {
    case "payment_intent.succeeded":
      newStatus = "payment succeed";
      break;
    case "payment_intent.payment_failed":
      newStatus = "payment failed";
      break;

    default:
      console.error(`Unhandled event type ${stripeEvent.type}`);
      return new Response(JSON.stringify({ message: "Unhandled event type" }), {
        headers: { "Content-Type": "application/json" },
      });
  }

  const { data: order, error: orderError } = await supabaseClient
    .from("order")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (orderError) {
    console.error("Error when tryin to update order", orderError);
  }

  return new Response(
    JSON.stringify({ message: `Order updated to ${newStatus}` }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
