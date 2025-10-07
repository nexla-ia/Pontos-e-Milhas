import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const AMADEUS_CLIENT_ID = "BkJ96jdklQNkWOZbeCRbNCEEgkGt46Kx";
const AMADEUS_CLIENT_SECRET = "EYji9XTinKKcy4j8";
const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authUrl = `${AMADEUS_BASE_URL}/v1/security/oauth2/token`;

    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", AMADEUS_CLIENT_ID);
    formData.append("client_secret", AMADEUS_CLIENT_SECRET);

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Amadeus auth failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ access_token: data.access_token }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
