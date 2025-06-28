import { useState } from 'react';
import { Search } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function CandidateSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Searching with:', { searchQuery });
      addToast({
        type: 'success',
        title: 'Search completed',
        message: 'Found matching candidates. Check the candidate list for results.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Search failed',
        message: 'An error occurred while searching for candidates.'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    addToast({
      type: 'info',
      title: 'Search cleared',
      message: 'Search query has been reset.'
    });
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Search by name, skills, company, or keywords..."
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={clearSearch}
            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Search Results Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Search Tips</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Use specific keywords, skills, or company names for better results. The search will look through all candidate data.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600 dark:text-blue-400">AI-Powered</p>
            <p className="text-xs text-blue-500 dark:text-blue-500">Smart matching</p>
          </div>
        </div>
      </div>
    </div>
  );
}