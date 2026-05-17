import React from 'react';

const Checkbox = ({ id, label, className = "", ...props }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 text-[#003366] focus:ring-[#003366] border-slate-300 rounded cursor-pointer"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="ml-2 block text-sm text-slate-500 cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
