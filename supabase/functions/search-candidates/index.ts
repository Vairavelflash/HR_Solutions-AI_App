const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SearchRequest {
  query: string;
  filters?: {
    skills?: string;
    experience?: string;
    company?: string;
    education?: string;
    location?: string;
  };
}

// PicaOS API configuration
const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get('PICA_SUPABASE_CONNECTION_KEY');
const SUPABASE_PROJECT_REF = Deno.env.get('SUPABASE_PROJECT_REF');

if (!PICA_SECRET_KEY || !PICA_SUPABASE_CONNECTION_KEY || !SUPABASE_PROJECT_REF) {
  throw new Error('Missing required environment variables: PICA_SECRET_KEY, PICA_SUPABASE_CONNECTION_KEY, or SUPABASE_PROJECT_REF');
}

async function searchCandidatesWithPicaOS(searchQuery: string, filters?: any) {
  try {
    // Build SQL query based on search term and filters
    let sqlQuery = `SELECT * FROM hr_solns_app WHERE 1=1`;
    
    if (searchQuery && searchQuery.trim()) {
      sqlQuery += ` AND (
        name ILIKE '%${searchQuery}%' OR 
        email ILIKE '%${searchQuery}%' OR 
        primary_skills ILIKE '%${searchQuery}%' OR 
        current_company ILIKE '%${searchQuery}%'
      )`;
    }

    // Add filters if provided
    if (filters) {
      if (filters.skills) {
        sqlQuery += ` AND primary_skills ILIKE '%${filters.skills}%'`;
      }
      if (filters.experience) {
        const expRange = filters.experience.split('-');
        if (expRange.length === 2) {
          sqlQuery += ` AND total_experience >= ${expRange[0]} AND total_experience <= ${expRange[1]}`;
        } else if (filters.experience.includes('+')) {
          const minExp = filters.experience.replace('+', '');
          sqlQuery += ` AND total_experience >= ${minExp}`;
        }
      }
      if (filters.company) {
        sqlQuery += ` AND current_company ILIKE '%${filters.company}%'`;
      }
    }

    sqlQuery += ` ORDER BY created_at DESC LIMIT 50;`;

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

    if (!response.ok) {
      throw new Error(`PicaOS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching candidates with PicaOS:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
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

    const { query, filters }: SearchRequest = await req.json();

    if (!query || typeof query !== 'string') {
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

    // Search candidates using PicaOS
    const searchResults = await searchCandidatesWithPicaOS(query, filters);

    return new Response(
      JSON.stringify({
        success: true,
        data: searchResults,
        query: query,
        filters: filters || {},
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