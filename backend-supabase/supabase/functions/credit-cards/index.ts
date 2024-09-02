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

  const { data } = await supabaseClient.auth.getUser();
  const user = data.user;

  let response;

  switch (req.method) {
    case "GET":
      const { data, error } = await supabaseClient
        .from("stripe_customer")
        .select("*, cards: stripe_card(*)")
        .eq("public_profile_id", user.id);
      response = data;
      if (error) throw error;
      break;
    case "POST":
      const { token, name } = await req.json();

      const { data: appStripeCustomer, error: error1 } = await supabaseClient
        .from("stripe_customer")
        .select("*")
        .eq("public_profile_id", user.id)
        .single();

      if (!appStripeCustomer)
        throw new Error("Stripe User not found in Supabase");

      const stripeCard = await stripe.paymentMethods.create({
        type: "card",
        card: {
          token,
        },
      });

      const attach = await stripe.paymentMethods.attach(stripeCard.id, {
        customer: appStripeCustomer.stripe_id,
      });

      if (!stripeCard) throw new Error("Card not created in Stripe");

      const { data: appCreditCard, error: appCreditCardError } =
        await supabaseClient.from("stripe_card").insert({
          stripe_id: stripeCard.id,
          name: name ?? "UNKNOWN",
          brand: stripeCard.card.brand,
          last_digits: stripeCard.card.last4,
          exp_month: stripeCard.card.exp_month,
          exp_year: stripeCard.card.exp_year,
          stripe_customer_id: appStripeCustomer.id,
        });

      if (appCreditCardError) console.error(appCreditCardError);
      if (!appCreditCard) throw new Error("Card not created in Supabase");

      response = appCreditCard;

      break;

    case "PATCH":
      // TODO
      break;
    case "DELETE":
      // TODO
      break;
  }

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json", corsHeaders },
  });
});
