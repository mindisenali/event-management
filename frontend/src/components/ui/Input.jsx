import React from 'react';

const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-white/60">{label}</label>}
      <input
        ref={ref}
        className={`input-base ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />

      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
});

export default Input;
