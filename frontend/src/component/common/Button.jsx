

const Button = ({ children, type = "button", variant = "primary", className = "", ...props }) => {
  const baseStyles = "w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors hover:scale-102 active:scale-98";
  
  const variants = {
    primary: "text-white bg-[#003366] hover:bg-[#002244] focus:ring-[#003366] border border-transparent",
    secondary: "text-[#003366] bg-slate-100 hover:bg-slate-200 border border-transparent",
    outline: "text-slate-700 bg-transparent border border-slate-300 hover:bg-slate-50",
    dangerous: "text-white bg-red-600 hover:bg-red-700 active:bg-red-600 border border-transparent"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
