
const FormInput = ({label, children}) => {
  return (
    <div className="flex flex-col gap-2 items-start justify-center">
      <h2 className="font-bold text-base">{label}</h2>
      {children}
    </div>
  )
}

export default FormInput