import { useState } from 'react';
import { Upload, FileText, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { supabase } from '../lib/supabase';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = pdfWorker;

// Mistral API configuration from environment variables
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MISTRAL_API_URL = import.meta.env.VITE_MISTRAL_API_URL;

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

  const extractDataWithMistral = async (text: string): Promise<FormData> => {
    const extractionPrompt = `
    Extract the following fields from the document and return only valid JSON:
    
    {
      "name": "",
      "email": "",
      "phone": "",
      "totalExperience": "",
      "currentCompany": "",
      "primarySkills": "",
      "collegeMarks": "",
      "yearPassedOut": ""
    }
    
    Use only the information from this document:
    ${text}
    
    Make sure:
    - 'totalExperience' should be just the number of years (e.g., "5" not "5 years")
    - 'collegeMarks' can be in formats like "85%", "8.5 CGPA", "700/800", "680 marks", or "Points: 123"
    - Return them as-is in the original format from the document
    - 'primarySkills' should be a comma-separated list of technical skills
    If any value is missing, return an empty string. No explanations, just valid JSON.
    `;

    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistral-small",
          messages: [
            {
              role: "system",
              content: "You extract structured data from documents and return only valid JSON."
            },
            {
              role: "user",
              content: extractionPrompt
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      const cleanJson = content.replace(/```json|```/g, "").trim();

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Mistral extraction error:', error);
      throw error;
    }
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
    setAiQuery('');
    setAiResponse('');

    try {
      let extractedText = '';
      
      if (selectedFile.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(selectedFile);
      } else {
        extractedText = await selectedFile.text();
      }

      const cleanedText = cleanText(extractedText);
      setRawText(cleanedText);

      // Extract data using Mistral AI
      const extractedData = await extractDataWithMistral(cleanedText);
      setFormData(extractedData);

      addToast({
        type: 'success',
        title: 'Resume processed successfully',
        message: 'AI has extracted and auto-filled the candidate information.'
      });
    } catch (error) {
      console.error('Error processing file:', error);
      addToast({
        type: 'error',
        title: 'Processing failed',
        message: 'An error occurred while processing the file with AI.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save to Supabase hr_solns_app table
      const { data, error } = await supabase
        .from('hr_solns_app')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            total_experience: parseInt(formData.totalExperience) || 0,
            current_company: formData.currentCompany,
            primary_skills: formData.primarySkills,
            college_marks: formData.collegeMarks,
            year_passed_out: parseInt(formData.yearPassedOut) || 0,
          }
        ])
        .select();

      if (error) throw error;

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
      setAiResponse('');
    } catch (error) {
      console.error('Error saving candidate:', error);
      addToast({
        type: 'error',
        title: 'Save failed',
        message: 'An error occurred while saving the candidate to the database.'
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
    setAiResponse('');

    const prompt = `Document:\n${rawText}\n\nQuestion: ${aiQuery}\n\nAnswer clearly and concisely:`;

    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistral-small",
          messages: [
            {
              role: "system",
              content: "You are a helpful HR assistant who answers questions about candidates based on their resume content. Provide clear, professional insights."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "No response received.";
      setAiResponse(reply);
      
      addToast({
        type: 'success',
        title: 'AI analysis complete',
        message: 'The AI has analyzed the resume and provided insights.'
      });
    } catch (error) {
      console.error('Mistral query error:', error);
      addToast({
        type: 'error',
        title: 'AI query failed',
        message: 'An error occurred while processing your AI query. Please try again.'
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
            {loading && <span className="text-sm text-blue-600">Processing with AI...</span>}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">College Marks</label>
            <input
              type="text"
              value={formData.collegeMarks}
              onChange={(e) => setFormData({ ...formData, collegeMarks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., 85%, 8.5 CGPA"
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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ask questions about the uploaded resume. The AI will analyze the content and provide insights.
        </p>
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ask AI about the candidate or resume..."
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleAiQuery()}
            />
            <button
              onClick={handleAiQuery}
              disabled={loading || !aiQuery.trim() || !rawText}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Send size={16} />
              <span>{loading ? 'Thinking...' : 'Ask Mistral'}</span>
            </button>
          </div>
          
          {aiResponse && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">AI Response:</h4>
              <p className="text-purple-700 dark:text-purple-300 whitespace-pre-wrap">{aiResponse}</p>
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
              placeholder="Extracted text will appear here after uploading a resume..."
            />
          </div>
        )}
      </div>
    </div>
  );
}