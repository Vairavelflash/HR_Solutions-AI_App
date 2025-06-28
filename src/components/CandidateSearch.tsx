import { useState } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface SearchFilters {
  skills: string;
  experience: string;
  company: string;
  education: string;
  location: string;
}

interface SearchResult {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_experience: number;
  current_company: string;
  primary_skills: string;
  college_marks: string;
  year_passed_out: number;
  created_at: string;
}

export default function CandidateSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    skills: '',
    experience: '',
    company: '',
    education: '',
    location: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      addToast({
        type: 'warning',
        title: 'Search query required',
        message: 'Please enter a search term to find candidates.'
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-candidates`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: searchQuery,
          filters: {
            skills: filters.skills || undefined,
            experience: filters.experience || undefined,
            company: filters.company || undefined,
            education: filters.education || undefined,
            location: filters.location || undefined,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.data || []);
        addToast({
          type: 'success',
          title: 'Search completed',
          message: `Found ${result.data?.length || 0} matching candidates.`
        });
      } else {
        throw new Error(result.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      addToast({
        type: 'error',
        title: 'Search failed',
        message: 'An error occurred while searching for candidates. Please try again.'
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      skills: '',
      experience: '',
      company: '',
      education: '',
      location: ''
    });
    setSearchResults([]);
    setHasSearched(false);
    addToast({
      type: 'info',
      title: 'Filters cleared',
      message: 'All search filters have been reset.'
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Search Candidates</h3>
        
        {/* Main Search Bar */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Search by name, skills, company, or keywords..."
            />
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center space-x-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., React, Python, AWS"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Any Experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                <input
                  type="text"
                  value={filters.company}
                  onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Current or previous company"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Education</label>
                <input
                  type="text"
                  value={filters.education}
                  onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Degree, university, or field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="City, state, or country"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <X size={16} />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search Results ({searchResults.length})
          </h4>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                {loading ? 'Searching...' : 'No candidates found matching your search criteria.'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 dark:text-white">{candidate.name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.total_experience} years experience
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.current_company}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {candidate.primary_skills.split(', ').map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>Marks: {candidate.college_marks}</span>
                    <span>Graduated: {candidate.year_passed_out}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Search Tips</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Use specific keywords, skills, or company names for better results. Advanced filters help narrow down candidates.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600 dark:text-blue-400">PicaOS Powered</p>
            <p className="text-xs text-blue-500 dark:text-blue-500">Smart database search</p>
          </div>
        </div>
      </div>
    </div>
  );
}