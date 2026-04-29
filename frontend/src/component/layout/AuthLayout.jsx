

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row max-w-5xl w-full mx-auto" style={{ minHeight: '600px' }}>
        {/* Left Side Banner */}
        <div className="w-full md:w-[45%] bg-[#003366] p-10 flex flex-col justify-between text-white border-r border-[#002244]">
          <div>
            <h1 className="text-3xl font-bold mb-1 tracking-tight">UniHub</h1>
            <p className="text-blue-200/80 text-sm font-medium">Workshop Management</p>
          </div>
          <div className="mt-20 md:mt-0">
            <h2 className="text-xl font-bold mb-3">Streamline Your Academic Events</h2>
            <p className="text-blue-100/90 text-sm leading-relaxed">
              Join our platform to easily organize, manage, and attend university workshops and seminars.
            </p>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="w-full md:w-[55%] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
