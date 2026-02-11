import { Sparkles, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { GeneratingPlan } from './GeneratingPlan';

interface CompetencyRating {
  id: string;
  name: string;
  rating: number | null;
}

export function CreatePlanForm() {
  const [jobDescMethod, setJobDescMethod] = useState<'upload' | 'url' | 'text'>('upload');
  const [hireName, setHireName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Assessment sections state
  const [interviewNotesEnabled, setInterviewNotesEnabled] = useState(false);
  const [interviewNotesExpanded, setInterviewNotesExpanded] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState('');
  
  const [competencyRatingsEnabled, setCompetencyRatingsEnabled] = useState(false);
  const [competencyRatingsExpanded, setCompetencyRatingsExpanded] = useState(false);
  const [competencyRatings, setCompetencyRatings] = useState<CompetencyRating[]>([
    { id: '1', name: 'Communication', rating: null },
    { id: '2', name: 'Strategic Thinking', rating: null },
    { id: '3', name: 'Stakeholder Management', rating: null },
    { id: '4', name: 'Problem Solving', rating: null },
    { id: '5', name: 'Collaboration', rating: null },
  ]);

  const [validationError, setValidationError] = useState('');

  const handleRatingChange = (competencyId: string, rating: number) => {
    setCompetencyRatings((prev) =>
      prev.map((comp) =>
        comp.id === competencyId ? { ...comp, rating } : comp
      )
    );
  };

  const handleInterviewNotesToggle = () => {
    const newEnabled = !interviewNotesEnabled;
    setInterviewNotesEnabled(newEnabled);
    if (newEnabled) {
      setInterviewNotesExpanded(true);
    } else {
      setInterviewNotesExpanded(false);
      setInterviewNotes('');
    }
    setValidationError('');
  };

  const handleCompetencyRatingsToggle = () => {
    const newEnabled = !competencyRatingsEnabled;
    setCompetencyRatingsEnabled(newEnabled);
    if (newEnabled) {
      setCompetencyRatingsExpanded(true);
    } else {
      setCompetencyRatingsExpanded(false);
      setCompetencyRatings([
        { id: '1', name: 'Communication', rating: null },
        { id: '2', name: 'Strategic Thinking', rating: null },
        { id: '3', name: 'Stakeholder Management', rating: null },
        { id: '4', name: 'Problem Solving', rating: null },
        { id: '5', name: 'Collaboration', rating: null },
      ]);
    }
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one assessment method has content
    const hasInterviewNotes = interviewNotesEnabled && interviewNotes.trim() !== '';
    const hasCompetencyRatings = competencyRatingsEnabled && competencyRatings.some(c => c.rating !== null);
    
    if (!hasInterviewNotes && !hasCompetencyRatings) {
      setValidationError('Please provide interview notes or competency ratings');
      return;
    }
    
    // Start generating
    setValidationError('');
    setIsGenerating(true);
  };

  // Show loading state while generating
  if (isGenerating) {
    return <GeneratingPlan hireName={hireName} />;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create Onboarding Plan</h1>
        <p className="text-gray-500">Enter details to generate a personalized plan</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hire Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hire Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={hireName}
            onChange={(e) => setHireName(e.target.value)}
            placeholder="Enter new hire's full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Job Description <span className="text-red-500">*</span>
          </label>
          
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setJobDescMethod('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                jobDescMethod === 'upload'
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setJobDescMethod('url')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                jobDescMethod === 'url'
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Provide URL
            </button>
            <button
              type="button"
              onClick={() => setJobDescMethod('text')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                jobDescMethod === 'text'
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Paste Text
            </button>
          </div>

          {/* File Upload Zone */}
          {jobDescMethod === 'upload' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                Drop file here or click to browse. Supports PDF, DOCX, TXT
              </p>
            </div>
          )}

          {jobDescMethod === 'url' && (
            <input
              type="url"
              placeholder="Enter job description URL"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {jobDescMethod === 'text' && (
            <textarea
              placeholder="Paste job description text here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          )}
        </div>

        {/* Candidate Assessment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Candidate Assessment <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Provide interview notes, competency ratings, or both (at least one required)
          </p>

          <div className="space-y-3">
            {/* Section A - Interview Notes */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center gap-3 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (!interviewNotesEnabled) {
                    handleInterviewNotesToggle();
                  } else {
                    setInterviewNotesExpanded(!interviewNotesExpanded);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={interviewNotesEnabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleInterviewNotesToggle();
                  }}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: '#0056D2' }}
                />
                <span className="flex-1 text-sm font-medium text-gray-700">
                  Interview Notes
                </span>
                {interviewNotesEnabled && (
                  interviewNotesExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )
                )}
              </div>

              {/* Content */}
              {interviewNotesEnabled && interviewNotesExpanded && (
                <div className="p-4 border-t border-gray-200">
                  <textarea
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    placeholder="Paste interview notes or feedback here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>

            {/* Section B - Competency Ratings */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center gap-3 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (!competencyRatingsEnabled) {
                    handleCompetencyRatingsToggle();
                  } else {
                    setCompetencyRatingsExpanded(!competencyRatingsExpanded);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={competencyRatingsEnabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCompetencyRatingsToggle();
                  }}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: '#0056D2' }}
                />
                <span className="flex-1 text-sm font-medium text-gray-700">
                  Competency Ratings
                </span>
                {competencyRatingsEnabled && (
                  competencyRatingsExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )
                )}
              </div>

              {/* Content */}
              {competencyRatingsEnabled && competencyRatingsExpanded && (
                <div className="p-6 border-t border-gray-200">
                  {/* Note at top */}
                  <p className="text-sm text-gray-600 mb-6">
                    Based on the job description, rate the candidate on each competency:
                  </p>

                  {/* Competency list */}
                  <div className="space-y-6">
                    {competencyRatings.map((comp, index) => (
                      <div key={comp.id}>
                        <div className="flex items-start justify-between gap-6">
                          {/* Competency name */}
                          <div className="min-w-[180px] pt-1">
                            <label className="text-sm font-medium text-gray-700">
                              {comp.name}
                            </label>
                          </div>

                          {/* Radio buttons */}
                          <div className="flex items-center gap-3">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <label
                                key={rating}
                                className="flex flex-col items-center gap-1 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`competency-${comp.id}`}
                                  value={rating}
                                  checked={comp.rating === rating}
                                  onChange={() => handleRatingChange(comp.id, rating)}
                                  className="w-4 h-4 cursor-pointer"
                                  style={{ accentColor: '#0056D2' }}
                                />
                                <span className="text-xs text-gray-500">{rating}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Scale labels - only show below first competency */}
                        {index === 0 && (
                          <div className="flex justify-end mt-2 text-xs text-gray-500">
                            <div className="flex gap-12 mr-1">
                              <span>1 = Needs Development</span>
                              <span>5 = Exceeds Expectations</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{validationError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: '#0056D2' }}
        >
          <Sparkles className="w-5 h-5" />
          Generate Plan
        </button>
      </form>
    </div>
  );
}