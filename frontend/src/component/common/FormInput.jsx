const FormInput = ({ label, required, ...props }) => {
  return (
    <div className="flex flex-col gap-2 items-start justify-center">
      <div className="flex flex-row gap-1">
        <h2 className="font-bold text-base">{label}</h2>
        {required && (<span className="text-red-500 font-bold">*</span>)}
      </div>
      <input {...props} />
    </div>
  );
};

export default FormInput;
