

const DisabledButton = ({
  children,    
  className = "",
  ...props
}) => {
  return (
    <button
      disabled
      {...props}
      className={`${className} w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors hover:scale-102 active:scale-98 text-white bg-[#003366]/80`}
    >
      {children}
    </button>
  );
};

export default DisabledButton