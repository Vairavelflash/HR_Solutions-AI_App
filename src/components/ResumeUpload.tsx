import { useState } from 'react';
import { Upload, FileText, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry?url';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = pdfWorker;

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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item: any) => typeof item.str === 'string' && item.str.trim() !== '')
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const cleanText = (text: string): string =>
    text
      .replace(/\s+/g, ' ')
      .replace(/Page \d+/gi, '')
      .trim()
      .substring(0, 5000);

  const extractDataFromText = (text: string): FormData => {
    // Simple regex-based extraction (in production, you'd use AI/ML)
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]{10,}/);
    const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m);
    
    // Extract experience (looking for patterns like "5 years", "3+ years", etc.)
    const expMatch = text.match(/(\d+)[\+]?\s*years?\s*(of\s*)?experience/i);
    
    // Extract skills (looking for common tech skills)
    const skillsPattern = /(React|Angular|Vue|Node\.js|Python|Java|JavaScript|TypeScript|PHP|Ruby|C\+\+|C#|AWS|Azure|Docker|Kubernetes|MongoDB|MySQL|PostgreSQL|Git|HTML|CSS)/gi;
    const skillsMatches = text.match(skillsPattern);
    const skills = skillsMatches ? [...new Set(skillsMatches)].join(', ') : '';
    
    // Extract marks/GPA (looking for patterns like "85%", "8.5 GPA", etc.)
    const marksMatch = text.match(/(\d+(?:\.\d+)?)\s*(%|GPA|CGPA)/i);
    
    // Extract graduation year
    const yearMatch = text.match(/(19|20)\d{2}/g);
    const graduationYear = yearMatch ? Math.max(...yearMatch.map(y => parseInt(y))) : '';

    return {
      name: nameMatch ? nameMatch[1] : '',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '',
      totalExperience: expMatch ? expMatch[1] : '',
      currentCompany: '', // Would need more sophisticated extraction
      primarySkills: skills,
      collegeMarks: marksMatch ? marksMatch[1] : '',
      yearPassedOut: graduationYear.toString()
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/plain') {
      addToast({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please upload a PDF or TXT file only.'
      });
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      let extractedText = '';
      
      if (selectedFile.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(selectedFile);
      } else {
        extractedText = await selectedFile.text();
      }

      const cleanedText = cleanText(extractedText);
      setRawText(cleanedText);

      // Extract data from text
      const extractedData = extractDataFromText(cleanedText);
      setFormData(extractedData);

      addToast({
        type: 'success',
        title: 'Resume uploaded successfully',
        message: 'Data has been extracted and auto-filled in the form.'
      });
    } catch (error) {
      console.error('Error processing file:', error);
      addToast({
        type: 'error',
        title: 'Processing failed',
        message: 'An error occurred while processing the file.'
      });
    } finally {
      setLoading(false);
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
    if (!aiQuery.trim() || !rawText) {
      addToast({
        type: 'warning',
        title: 'Missing information',
        message: 'Please upload a resume and enter a question.'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Simulate AI response based on the extracted text
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        `Based on the resume analysis, this candidate shows strong technical skills with experience in ${formData.primarySkills || 'various technologies'}.`,
        `The candidate has ${formData.totalExperience || 'several'} years of experience and graduated in ${formData.yearPassedOut || 'recent years'}.`,
        `Skills alignment shows good match with modern development requirements. College performance: ${formData.collegeMarks || 'Not specified'}%.`,
        `Educational background and project experience indicate strong problem-solving abilities and technical competency.`
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
            {loading && <span className="text-sm text-blue-600">Processing...</span>}
          </div>
        )}
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
              disabled={loading || !aiQuery.trim() || !rawText}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Send size={16} />
              <span>{loading ? 'Thinking...' : 'Ask'}</span>
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