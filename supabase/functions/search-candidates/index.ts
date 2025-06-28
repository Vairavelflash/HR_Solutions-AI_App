const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SearchRequest {
  query: string;
}

// PicaOS API configuration
const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get('PICA_SUPABASE_CONNECTION_KEY');
const SUPABASE_PROJECT_REF = Deno.env.get('SUPABASE_PROJECT_REF');

console.log('Environment check:', {
  PICA_SECRET_KEY: PICA_SECRET_KEY ? 'Set' : 'Missing',
  PICA_SUPABASE_CONNECTION_KEY: PICA_SUPABASE_CONNECTION_KEY ? 'Set' : 'Missing',
  SUPABASE_PROJECT_REF: SUPABASE_PROJECT_REF ? 'Set' : 'Missing'
});

if (!PICA_SECRET_KEY || !PICA_SUPABASE_CONNECTION_KEY || !SUPABASE_PROJECT_REF) {
  console.error('Missing environment variables:', {
    PICA_SECRET_KEY: !!PICA_SECRET_KEY,
    PICA_SUPABASE_CONNECTION_KEY: !!PICA_SUPABASE_CONNECTION_KEY,
    SUPABASE_PROJECT_REF: !!SUPABASE_PROJECT_REF
  });
  throw new Error('Missing required environment variables: PICA_SECRET_KEY, PICA_SUPABASE_CONNECTION_KEY, or SUPABASE_PROJECT_REF');
}

async function searchCandidatesWithPicaOS(searchQuery: string) {
  try {
    // Escape single quotes to prevent SQL injection
    const escapedQuery = searchQuery.replace(/'/g, "''");
    
    // Build comprehensive SQL query that searches across all relevant fields
    const sqlQuery = `
      SELECT * FROM hr_solns_app 
      WHERE 
        name ILIKE '%${escapedQuery}%' OR 
        email ILIKE '%${escapedQuery}%' OR 
        phone ILIKE '%${escapedQuery}%' OR
        primary_skills ILIKE '%${escapedQuery}%' OR 
        current_company ILIKE '%${escapedQuery}%' OR
        college_marks ILIKE '%${escapedQuery}%' OR
        CAST(total_experience AS TEXT) ILIKE '%${escapedQuery}%' OR
        CAST(year_passed_out AS TEXT) ILIKE '%${escapedQuery}%'
      ORDER BY created_at DESC 
      LIMIT 50;
    `;

    console.log('Executing SQL query:', sqlQuery);

    // Make request to PicaOS API
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pica-secret': PICA_SECRET_KEY,
          'x-pica-connection-key': PICA_SUPABASE_CONNECTION_KEY,
          'x-pica-action-id': 'conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg',
        },
        body: JSON.stringify({
          query: sqlQuery
        })
      }
    );

    console.log('PicaOS API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PicaOS API error response:', errorText);
      throw new Error(`PicaOS API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('PicaOS API response data:', data);
    return data;
  } catch (error) {
    console.error('Error searching candidates with PicaOS:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  console.log('Received request:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const requestBody = await req.text();
    console.log('Request body:', requestBody);

    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON', 
          message: 'Request body must be valid JSON' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const { query }: SearchRequest = parsedBody;

    if (!query || typeof query !== 'string') {
      console.log('Invalid query parameter:', query);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request', 
          message: 'Query parameter is required and must be a string' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log('Searching for:', query);

    // Search candidates using PicaOS
    const searchResults = await searchCandidatesWithPicaOS(query);

    console.log('Search completed, returning results');

    return new Response(
      JSON.stringify({
        success: true,
        data: searchResults,
        query: query,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Search candidates error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});