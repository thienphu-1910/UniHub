const FormContainer = ({children, className}) => {
  return (
    <div className={`bg-white rounded-xl shadow-xs border border-blue-200 ${className}`}>
      {children}
    </div>
  )
}

export default FormContainer