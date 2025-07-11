import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Mail, Phone, Building, X, Edit } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { supabase, CandidateData } from '../lib/supabase';

interface CandidateModalProps {
  candidate: CandidateData | null;
  isOpen: boolean;
  onClose: () => void;
}

function CandidateModal({ candidate, isOpen, onClose }: CandidateModalProps) {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Candidate Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <p className="text-gray-900 dark:text-white font-medium">{candidate.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-500" />
                <p className="text-gray-900 dark:text-white">{candidate.email}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-gray-500" />
                <p className="text-gray-900 dark:text-white">{candidate.phone}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
              <p className="text-gray-900 dark:text-white">{candidate.total_experience} years</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Company</label>
              <div className="flex items-center space-x-2">
                <Building size={16} className="text-gray-500" />
                <p className="text-gray-900 dark:text-white">{candidate.current_company}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College Marks</label>
              <p className="text-gray-900 dark:text-white">{candidate.college_marks}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year Passed Out</label>
              <p className="text-gray-900 dark:text-white">{candidate.year_passed_out}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Skills</label>
            <div className="flex flex-wrap gap-2">
              {candidate.primary_skills.split(', ').map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Schedule Interview
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EditCandidateModalProps {
  candidate: CandidateData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: CandidateData) => void;
}

function EditCandidateModal({ candidate, isOpen, onClose, onSave }: EditCandidateModalProps) {
  const [formData, setFormData] = useState<CandidateData>({
    name: '',
    email: '',
    phone: '',
    total_experience: 0,
    current_company: '',
    primary_skills: '',
    college_marks: '',
    year_passed_out: 0
  });
  const { addToast } = useToast();

  // Initialize form data when modal opens or candidate changes
  useEffect(() => {
    if (candidate && isOpen) {
      setFormData({ ...candidate });
    }
  }, [candidate, isOpen]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('hr_solns_app')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          total_experience: formData.total_experience,
          current_company: formData.current_company,
          primary_skills: formData.primary_skills,
          college_marks: formData.college_marks,
          year_passed_out: formData.year_passed_out,
        })
        .eq('id', candidate.id);

      if (error) throw error;

      onSave(formData);
      addToast({
        type: 'success',
        title: 'Candidate updated',
        message: 'Candidate information has been successfully updated.'
      });
      onClose();
    } catch (error) {
      console.error('Error updating candidate:', error);
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'An error occurred while updating the candidate.'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Candidate</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (Years)</label>
              <input
                type="number"
                value={formData.total_experience}
                onChange={(e) => setFormData({ ...formData, total_experience: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Company</label>
              <input
                type="text"
                value={formData.current_company}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">College Marks</label>
              <input
                type="text"
                value={formData.college_marks}
                onChange={(e) => setFormData({ ...formData, college_marks: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year Passed Out</label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={formData.year_passed_out}
                onChange={(e) => setFormData({ ...formData, year_passed_out: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Skills</label>
            <input
              type="text"
              value={formData.primary_skills}
              onChange={(e) => setFormData({ ...formData, primary_skills: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., React, Python, AWS"
              required
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CandidateList() {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<CandidateData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const candidatesPerPage = 3;

  // Fetch candidates from Supabase
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('hr_solns_app')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      addToast({
        type: 'error',
        title: 'Failed to load candidates',
        message: 'An error occurred while loading candidate data.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.primary_skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.current_company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(startIndex, startIndex + candidatesPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewCandidate = (candidate: CandidateData) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const handleEditCandidate = (candidate: CandidateData) => {
    setEditingCandidate(candidate);
    setShowEditModal(true);
  };

  const handleSaveCandidate = (updatedCandidate: CandidateData) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === updatedCandidate.id ? updatedCandidate : candidate
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Search candidates..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={handleClear}
              className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Candidates ({filteredCandidates.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{candidate.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {candidate.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {candidate.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {candidate.total_experience} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {candidate.current_company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                    {candidate.primary_skills}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {candidate.college_marks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {candidate.year_passed_out}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewCandidate(candidate)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditCandidate(candidate)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        title="Edit Candidate"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + candidatesPerPage, filteredCandidates.length)} of {filteredCandidates.length} candidates
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <CandidateModal
        candidate={selectedCandidate}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      <EditCandidateModal
        candidate={editingCandidate}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveCandidate}
      />
    </div>
  );
}