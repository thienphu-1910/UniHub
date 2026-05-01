const Container = ({children, className}) => {
  return (
    <div className={`bg-white rounded-lg shadow-xs border border-blue-200 ${className}`}>
      {children}
    </div>
  );
}

export default Container;