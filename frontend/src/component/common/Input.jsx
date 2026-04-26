import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, id, icon: Icon, rightElement, error, type = "text", className = "", ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-800 mb-1.5" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-10' : 'pr-4'} py-2.5 bg-white border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-[#003366] focus:border-[#003366]'} rounded-md text-sm focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-400 ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
