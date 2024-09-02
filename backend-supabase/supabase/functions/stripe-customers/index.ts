import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "npm:stripe";

Deno.serve(async (req) => {
  const { public_profile_id, email } = await req.json();

  const stripe = Stripe(
    Deno.env.get("STRIPE_API_KEY"),

    {
      httpClient: Stripe.createFetchHttpClient(),
    }
  );

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    }
  );

  const stripeCustomer = await stripe.customers.create({
    email: email,  
    metadata: {
      public_profile_id: public_profile_id,
    },
  });

  if (!stripeCustomer) throw new Error("Stripe customer not created in Stripe");

  const {data: appStripeCustomer, error: appStripeCustomerError} = await supabaseClient
    .from("stripe_customer")
    .insert({
      stripe_id: stripeCustomer.id,
      public_profile_id: public_profile_id,
    });
  if (!appStripeCustomer)
    console.error('error:', appStripeCustomerError)
    throw new Error("Stripe customer not created in Supabase");

  return new Response(JSON.stringify({ data: appStripeCustomer }), {
    headers: { "Content-Type": "application/json", corsHeaders },
  });
});
