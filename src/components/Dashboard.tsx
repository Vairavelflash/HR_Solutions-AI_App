import { useState } from 'react';
import { FileText, Search, Users } from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import CandidateSearch from './CandidateSearch';
import CandidateList from './CandidateList';

type TabType = 'upload' | 'search' | 'candidates';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  const tabs = [
    { id: 'upload', label: 'Resume Upload', icon: FileText },
    { id: 'search', label: 'Candidate Search', icon: Search },
    { id: 'candidates', label: 'Candidate List', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">HR Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Streamline your hiring process with AI-powered resume screening and candidate management.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'upload' && <ResumeUpload />}
        {activeTab === 'search' && <CandidateSearch />}
        {activeTab === 'candidates' && <CandidateList />}
      </div>
    </div>
  );
}