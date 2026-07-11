import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

const LegalHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center mr-4 text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold">Legal Documents</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/legal/privacy-policy" className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors bg-[var(--cardBackground)] shadow-sm hover:shadow-md">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 mr-3 text-[var(--primary)]" />
              <h2 className="text-xl font-semibold">Privacy Policy</h2>
            </div>
            <p className="text-[var(--textSecondary)]">
              Learn about how we collect, use, and protect your information when using Prompt Catalyst.
            </p>
          </Link>

          <Link to="/legal/terms-of-service" className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors bg-[var(--cardBackground)] shadow-sm hover:shadow-md">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 mr-3 text-[var(--primary)]" />
              <h2 className="text-xl font-semibold">Terms of Service</h2>
            </div>
            <p className="text-[var(--textSecondary)]">
              Read the terms and conditions that govern your use of Prompt Catalyst.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegalHub;