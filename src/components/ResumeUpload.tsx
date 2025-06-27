import { useState } from 'react';
import { Upload, FileText, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface FormData {
  name: string;
  email: string;
  phone: string;
  totalExperience: string;
  currentCompany: string;
  primarySkills: string;
  collegeMarks: string;
  yearPassedOut: string;
}

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    totalExperience: '',
    currentCompany: '',
    primarySkills: '',
    collegeMarks: '',
    yearPassedOut: ''
  });
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      setFile(selectedFile);
      // Simulate PDF text extraction
      setRawText(`Sample extracted text from ${selectedFile.name}:\n\nJohn Doe\nSoftware Engineer\nExperience: 5 years\nSkills: React, Node.js, Python\nEducation: Computer Science, XYZ University\nPhone: +1234567890\nEmail: john.doe@email.com`);
      
      // Auto-fill form with extracted data
      setFormData({
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        totalExperience: '5',
        currentCompany: 'Tech Corp',
        primarySkills: 'React, Node.js, Python',
        collegeMarks: '85',
        yearPassedOut: '2018'
      });

      addToast({
        type: 'success',
        title: 'Resume uploaded successfully',
        message: 'Data has been extracted and auto-filled in the form.'
      });
    } else {
      addToast({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please upload a PDF or TXT file only.'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Candidate data submitted:', formData);
      addToast({
        type: 'success',
        title: 'Candidate saved successfully',
        message: 'The candidate information has been added to the database.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        totalExperience: '',
        currentCompany: '',
        primarySkills: '',
        collegeMarks: '',
        yearPassedOut: ''
      });
      setFile(null);
      setRawText('');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save failed',
        message: 'An unexpected error occurred while saving the candidate.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setLoading(true);
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        "Based on the resume analysis, this candidate has strong technical skills in modern web development technologies.",
        "The candidate shows 5 years of progressive experience with a focus on full-stack development.",
        "Skills alignment shows 85% match with senior developer requirements.",
        "Educational background and project experience indicate strong problem-solving abilities."
      ];
      
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
      
      addToast({
        type: 'info',
        title: 'AI analysis complete',
        message: 'The AI has analyzed the resume and provided insights.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'AI query failed',
        message: 'An error occurred while processing your AI query.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resume Upload</h3>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Drop your resume here, or <span className="text-blue-600">browse</span>
              </span>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">PDF or TXT files only</p>
          </div>
        </div>
        
        {file && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-400">{file.name}</span>
          </div>
        )}
        
        <button
          onClick={() => console.log('Processing file...')}
          disabled={!file}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Extract Data
        </button>
      </div>

      {/* Manual Data Entry Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Candidate Information</h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Email address"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Phone number"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Experience (Years)</label>
            <input
              type="number"
              value={formData.totalExperience}
              onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Years of experience"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Company</label>
            <input
              type="text"
              value={formData.currentCompany}
              onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Current company name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Skills</label>
            <input
              type="text"
              value={formData.primarySkills}
              onChange={(e) => setFormData({ ...formData, primarySkills: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., React, Python, AWS"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">College Marks (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.collegeMarks}
              onChange={(e) => setFormData({ ...formData, collegeMarks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Percentage"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year Passed Out</label>
            <input
              type="number"
              min="1990"
              max="2030"
              value={formData.yearPassedOut}
              onChange={(e) => setFormData({ ...formData, yearPassedOut: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Graduation year"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Candidate'}
            </button>
          </div>
        </form>
      </div>

      {/* AI Chat Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Assistant</h3>
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ask AI about the candidate or resume..."
            />
            <button
              onClick={handleAiQuery}
              disabled={loading || !aiQuery.trim()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Send size={16} />
              <span>Ask</span>
            </button>
          </div>
          
          {aiResponse && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-purple-700 dark:text-purple-300">{aiResponse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Raw Text Accordion */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Raw Resume Text</h3>
          {showRawText ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {showRawText && (
          <div className="mt-4">
            <textarea
              value={rawText}
              readOnly
              className="w-full h-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="Extracted text will appear here..."
            />
          </div>
        )}
      </div>
    </div>
  );
}