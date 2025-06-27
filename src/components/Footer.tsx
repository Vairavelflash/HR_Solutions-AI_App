import { Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hire Fast</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI-powered HR solutions to streamline your recruitment process and find the perfect candidates faster.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Resume Screening</li>
              <li>AI Data Extraction</li>
              <li>Candidate Search</li>
              <li>Smart Filtering</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Connect</h4>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Github size={20} />
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Made with <Heart size={16} className="mx-1 text-red-500" /> for better hiring
          </p>
        </div>
      </div>
    </footer>
  );
}