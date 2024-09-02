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
  const { data } = await supabaseClient.auth.getUser();
  const user = data.user;
  const stripe = Stripe(Deno.env.get("STRIPE_API_KEY"), {
    httpClient: Stripe.createFetchHttpClient(),
  });

  let response;

  switch (req.method) {
    case "GET":
      const { data, error } = await supabaseClient
        .from("public_profile")
        .select();
      response = data;

      break;
    case "POST":
      const { order_id, stripe_card_id } = await req.json();
      const { data: appStripeCustomer, error: appStripeCustomerError } =
        await supabaseClient
          .from("stripe_customer")
          .select("*, cards: stripe_card(*)")
          .eq("public_profile_id", user.id)
          .single();
      if (!appStripeCustomer)
        throw new Error("Stripe User not found in Supabase");

      const card = appStripeCustomer.cards.find(
        (card) => card.id === stripe_card_id
      );

      if (!card) throw new Error("Card not found for this user");

      const { data: order, error: orderError } = await supabaseClient
        .from("order")
        .select("*, billing: billing(*)")
        .eq("id", order_id)
        .single();

      if (orderError) console.error(orderError);
      if (!order) throw new Error("Order not found ");

      const paymentIntent = await stripe.paymentIntents.create({
        amount: formatPriceForStripe(order.billing[0].total_amount),
        currency: "eur",
        customer: appStripeCustomer.stripe_id,
        payment_method: card.stripe_id,
        confirm: true,
        return_url: "https://fliiink.com",
        metadata: {
          order_id: order.id,
        },
      });

      response = paymentIntent;

      break;
    case "PATCH":
      // TODO
      break;
    case "DELETE":
      // TODO
      break;
  }

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
});

function formatPriceForStripe(price: number) {
  const formattedPrice = Math.floor(price * 100);
  return formattedPrice;
}
