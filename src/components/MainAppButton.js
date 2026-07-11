import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MainAppButton = () => {
  return (
    <Link
      to="/"
      className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-primary px-4 py-2 rounded-lg text-white shadow-lg hover:bg-primary-600 transition-colors"
    >
      <ArrowLeft size={16} />
      <span>Back to App</span>
    </Link>
  );
};

export default MainAppButton;
