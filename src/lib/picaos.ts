import { Pica } from '@picahq/ai';

const picaApiKey = import.meta.env.VITE_PICAOS_API_KEY;
const picaConnectionKey = import.meta.env.VITE_PICAOS_CONNECTION_KEY;

if (!picaApiKey || !picaConnectionKey) {
  throw new Error('Missing PicaOS AI environment variables');
}

export const Pica = new Pica({
  apiKey: picaApiKey,
});

export const searchCandidatesWithAI = async (query: string) => {
  try {
    const response = await Pica.query({
      connectionKey: picaConnectionKey,
      query: query,
      table: 'hr_solns_app',
    });
    
    return response;
  } catch (error) {
    console.error('PicaOS AI search error:', error);
    throw error;
  }
};

export interface PicaSearchResult {
  data: any[];
  explanation?: string;
  confidence?: number;
}