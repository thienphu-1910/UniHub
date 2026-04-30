const FormInput = ({ label, ...props }) => {
  return (
    <div className="flex flex-col gap-2 items-start justify-center">
      <h2 className="font-bold text-base">{label}</h2>
      <input {...props} />
    </div>
  );
};

export default FormInput;
