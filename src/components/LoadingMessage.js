import React from 'react';
import { Cat } from 'lucide-react';
import MinimalisticLoadingMessage from './MinimalisticLoadingMessage';

export const LoadingMessage = () => {
  return (
    <div className="message-group message-group-assistant">
      <div className="flex items-start gap-3">
        <Cat size={20} className="text-[var(--textSecondary)] mt-2" />
        <div className="flex-1 max-w-[600px]">
          <MinimalisticLoadingMessage />
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;