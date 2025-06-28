import { useState } from 'react';
import { Search, Sparkles, User, Building, Code, Calendar } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { searchCandidatesWithAI, PicaSearchResult } from '../lib/picaos';
import { CandidateData } from '../lib/supabase';

interface SearchResultsProps {
  results: PicaSearchResult | null;
  loading: boolean;
}

function SearchResults({ results, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">AI is searching candidates...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!results || !results.data || results.data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Search Results ({results.data.length} found)
            </h3>
          </div>
          {results.confidence && (
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Confidence: {Math.round(results.confidence * 100)}%
            </div>
          )}
        </div>
        {results.explanation && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {results.explanation}
          </p>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {results.data.map((candidate: CandidateData, index: number) => (
          <div key={candidate.id || index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {candidate.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {candidate.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.current_company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.total_experience} years
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Marks</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.college_marks}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Graduated</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.year_passed_out}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.primary_skills.split(', ').map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  View Profile
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CandidateSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PicaSearchResult | null>(null);
  const { addToast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty search',
        message: 'Please enter a search query.'
      });
      return;
    }

    setLoading(true);
    setSearchResults(null);
    
    try {
      const results = await searchCandidatesWithAI(searchQuery);
      setSearchResults(results);
      
      addToast({
        type: 'success',
        title: 'Search completed',
        message: `Found ${results.data?.length || 0} matching candidates using AI.`
      });
    } catch (error) {
      console.error('Search error:', error);
      addToast({
        type: 'error',
        title: 'Search failed',
        message: 'An error occurred while searching for candidates with AI.'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    addToast({
      type: 'info',
      title: 'Search cleared',
      message: 'Search query and results have been reset.'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Candidate Search</h3>
        </div>
        
        {/* Main Search Bar */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ask AI to find candidates... e.g., 'Find React developers with 3+ years experience' or 'Show me candidates from tech companies'"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Searching...' : 'AI Search'}</span>
          </button>
          <button
            onClick={clearSearch}
            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Search Examples */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Try these AI search examples:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => setSearchQuery('Find candidates with React and Node.js skills')}
              className="text-left text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
            >
              • "Find candidates with React and Node.js skills"
            </button>
            <button
              onClick={() => setSearchQuery('Show me senior developers with 5+ years experience')}
              className="text-left text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
            >
              • "Show me senior developers with 5+ years experience"
            </button>
            <button
              onClick={() => setSearchQuery('Find candidates from Google or Microsoft')}
              className="text-left text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
            >
              • "Find candidates from Google or Microsoft"
            </button>
            <button
              onClick={() => setSearchQuery('Show candidates with high college marks')}
              className="text-left text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
            >
              • "Show candidates with high college marks"
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <SearchResults results={searchResults} loading={loading} />

      {/* AI Features Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-indigo-900 dark:text-indigo-100 flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Powered by PicaOS AI</span>
            </h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
              Natural language search that understands context and finds the most relevant candidates from your database.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-600 dark:text-indigo-400">Intelligent Matching</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-500">Real-time results</p>
          </div>
        </div>
      </div>
    </div>
  );
}