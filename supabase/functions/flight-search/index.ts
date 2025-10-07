import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const AMADEUS_CLIENT_ID = "BkJ96jdklQNkWOZbeCRbNCEEgkGt46Kx";
const AMADEUS_CLIENT_SECRET = "EYji9XTinKKcy4j8";
const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

async function getAccessToken(): Promise<string> {
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
    throw new Error(`Auth failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  currencyCode?: string;
  max?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const params: FlightSearchParams = await req.json();

    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      currencyCode = "BRL",
      max = 5,
    } = params;

    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const accessToken = await getAccessToken();

    const searchParams = new URLSearchParams({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: adults.toString(),
      currencyCode,
      max: max.toString(),
    });

    if (returnDate) {
      searchParams.append("returnDate", returnDate);
    }

    const searchUrl = `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${searchParams.toString()}`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flight search failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const simplifiedResults = data.data?.map((offer: any) => {
      const firstSegment = offer.itineraries[0]?.segments[0];
      const lastSegment = offer.itineraries[0]?.segments[offer.itineraries[0].segments.length - 1];

      const returnFirstSegment = offer.itineraries[1]?.segments[0];
      const returnLastSegment = offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1];

      const outboundDuration = offer.itineraries[0]?.duration;
      const returnDuration = offer.itineraries[1]?.duration;

      const airlineName = firstSegment?.carrierCode || "N/A";
      const flightNumber = `${firstSegment?.carrierCode}${firstSegment?.number}` || "N/A";

      const stops = (offer.itineraries[0]?.segments.length - 1) || 0;
      const aircraft = firstSegment?.aircraft?.code || "N/A";

      const price = offer.price?.total || "N/A";

      return {
        id: offer.id,
        airline: airlineName,
        flightNumber,
        outbound: {
          departure: {
            airport: firstSegment?.departure?.iataCode,
            time: firstSegment?.departure?.at,
          },
          arrival: {
            airport: lastSegment?.arrival?.iataCode,
            time: lastSegment?.arrival?.at,
          },
          duration: outboundDuration,
          stops,
        },
        return: returnFirstSegment ? {
          departure: {
            airport: returnFirstSegment?.departure?.iataCode,
            time: returnFirstSegment?.departure?.at,
          },
          arrival: {
            airport: returnLastSegment?.arrival?.iataCode,
            time: returnLastSegment?.arrival?.at,
          },
          duration: returnDuration,
          stops: (offer.itineraries[1]?.segments.length - 1) || 0,
        } : null,
        aircraft,
        price: {
          total: price,
          currency: offer.price?.currency || currencyCode,
        },
      };
    }) || [];

    return new Response(
      JSON.stringify({ results: simplifiedResults }),
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
