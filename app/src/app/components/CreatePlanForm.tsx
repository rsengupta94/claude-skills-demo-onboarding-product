import { Sparkles, Upload, ChevronDown, ChevronRight, Search, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GeneratingPlan } from './GeneratingPlan';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import api, { type JDAnalysisResult } from '../services/api';

interface CompetencyRating {
  id: string;
  name: string;
  category: 'technical' | 'behavioral';
  importance: 'high' | 'moderate' | 'low';
  rating: number | null;
}

export function CreatePlanForm() {
  const navigate = useNavigate();

  const [jobDescMethod, setJobDescMethod] = useState<'upload' | 'url' | 'text'>('text');
  const [jobDescText, setJobDescText] = useState('');
  const [hireName, setHireName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState<string | null>(null);

  // JD Analysis state
  const [isAnalyzingJD, setIsAnalyzingJD] = useState(false);
  const [jdAnalyzed, setJdAnalyzed] = useState(false);
  const [jdAnalysisError, setJdAnalysisError] = useState<string | null>(null);
  const [extractedCompetencies, setExtractedCompetencies] = useState<JDAnalysisResult | null>(null);

  // Assessment sections state
  const [interviewNotesEnabled, setInterviewNotesEnabled] = useState(false);
  const [interviewNotesExpanded, setInterviewNotesExpanded] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState('');

  const [competencyRatingsEnabled, setCompetencyRatingsEnabled] = useState(false);
  const [competencyRatingsExpanded, setCompetencyRatingsExpanded] = useState(false);
  const [competencyRatings, setCompetencyRatings] = useState<CompetencyRating[]>([]);

  const [validationError, setValidationError] = useState('');

  // Handle JD analysis
  const handleAnalyzeJD = async () => {
    if (!jobDescText.trim()) {
      setJdAnalysisError('Please enter job description text');
      return;
    }

    setIsAnalyzingJD(true);
    setJdAnalysisError(null);

    try {
      const result = await api.analyzeJobDescription(jobDescText);
      setExtractedCompetencies(result);
      setJdAnalyzed(true);

      // Transform extracted competencies to rating format
      const ratings: CompetencyRating[] = result.competencies.map((comp, index) => ({
        id: String(index + 1),
        name: comp.competency,
        category: comp.category,
        importance: comp.importance,
        rating: null
      }));

      setCompetencyRatings(ratings);

      // Show notification if new buckets were created
      if (result.newBuckets && result.newBuckets.length > 0) {
        const newBucketNames = result.newBuckets.map(b => b.groupName).join(', ');
        alert(`✨ New skill area${result.newBuckets.length > 1 ? 's' : ''} identified: ${newBucketNames}`);
      }

    } catch (error: any) {
      setJdAnalysisError(error.message || 'Failed to analyze job description');
      setJdAnalyzed(false);
    } finally {
      setIsAnalyzingJD(false);
    }
  };

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
    }
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one assessment method has content
    const hasInterviewNotes = interviewNotesEnabled && interviewNotes.trim() !== '';
    const hasCompetencyRatings = competencyRatingsEnabled && competencyRatings.some(c => c.rating !== null);

    if (!hasInterviewNotes && !hasCompetencyRatings) {
      setValidationError('Please provide interview notes or competency ratings');
      return;
    }

    if (!hireName.trim()) {
      setValidationError('Please enter hire name');
      return;
    }

    if (!jobDescText.trim()) {
      setValidationError('Please enter job description');
      return;
    }

    // Start generating
    setValidationError('');
    setIsGenerating(true);

    try {
      // Prepare assessment data
      const assessment: any = {};

      if (hasInterviewNotes) {
        assessment.interviewNotes = interviewNotes;
      }

      if (hasCompetencyRatings) {
        assessment.competencyRatings = competencyRatings
          .filter(c => c.rating !== null)
          .map(c => ({
            competency: c.name,
            rating: c.rating!
          }));
      }

      // Call API to create plan
      const response = await api.createPlan({
        hireName,
        jobDescription: jobDescText,
        assessment
      });

      setGeneratedEmployeeId(response.employeeId);

    } catch (error: any) {
      setValidationError(error.message || 'Failed to generate plan');
      setIsGenerating(false);
    }
  };

  // Show loading state while generating
  if (isGenerating && generatedEmployeeId) {
    return <GeneratingPlan hireName={hireName} employeeId={generatedEmployeeId} />;
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
              <p className="text-xs text-gray-500 mt-2">
                File upload coming soon - please use "Paste Text" for now
              </p>
            </div>
          )}

          {jobDescMethod === 'url' && (
            <input
              type="url"
              placeholder="Enter job description URL (coming soon - please use Paste Text)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />
          )}

          {jobDescMethod === 'text' && (
            <div className="space-y-3">
              <textarea
                value={jobDescText}
                onChange={(e) => {
                  setJobDescText(e.target.value);
                  setJdAnalyzed(false);
                  setJdAnalysisError(null);
                }}
                placeholder="Paste job description text here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />

              {/* Analyze JD Button */}
              {jobDescText.trim() && !jdAnalyzed && (
                <button
                  type="button"
                  onClick={handleAnalyzeJD}
                  disabled={isAnalyzingJD}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzingJD ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Analyzing Job Description...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Analyze Job Description</span>
                    </>
                  )}
                </button>
              )}

              {/* JD Analysis Status */}
              {jdAnalyzed && extractedCompetencies && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">
                        Job Description Analyzed
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Extracted {extractedCompetencies.competencies.length} competencies for {extractedCompetencies.roleTitle}
                      </p>
                      {extractedCompetencies.newBuckets && extractedCompetencies.newBuckets.length > 0 && (
                        <p className="text-sm text-green-700 mt-1">
                          ✨ {extractedCompetencies.newBuckets.length} new skill area(s) identified
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* JD Analysis Error */}
              {jdAnalysisError && (
                <ErrorMessage
                  title="Analysis Failed"
                  message={jdAnalysisError}
                  onRetry={handleAnalyzeJD}
                />
              )}
            </div>
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
                  {/* Show message if JD not analyzed yet */}
                  {!jdAnalyzed && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        Click "Analyze Job Description" above to extract competencies from the JD
                      </p>
                    </div>
                  )}

                  {jdAnalyzed && competencyRatings.length > 0 && (
                    <>
                      {/* Note at top */}
                      <p className="text-sm text-gray-600 mb-6">
                        Based on the job description, rate the candidate on each competency:
                      </p>

                      {/* Competency list */}
                      <div className="space-y-6">
                        {competencyRatings.map((comp, index) => (
                          <div key={comp.id}>
                            <div className="flex items-start justify-between gap-6">
                              {/* Competency name with importance badge */}
                              <div className="min-w-[180px] pt-1">
                                <label className="text-sm font-medium text-gray-700">
                                  {comp.name}
                                </label>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                  comp.importance === 'high' ? 'bg-red-100 text-red-700' :
                                  comp.importance === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {comp.importance}
                                </span>
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
                    </>
                  )}
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
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#0056D2' }}
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
