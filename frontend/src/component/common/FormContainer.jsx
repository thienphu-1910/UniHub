const FormContainer = ({children, className}) => {
  return (
    <div className={`bg-white rounded-xl shadow-xs ${className}`}>
      {children}
    </div>
  )
}

export default FormContainer