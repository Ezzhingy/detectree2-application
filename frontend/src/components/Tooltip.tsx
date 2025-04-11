import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="relative flex items-center group">
      <InformationCircleIcon className="w-5 h-5 text-gray-500 cursor-pointer ml-2" />
      <div className="absolute left-full ml-2 w-48 p-2 bg-slate-700 text-white text-md rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
        {text}
      </div>
    </div>
  );
}; 