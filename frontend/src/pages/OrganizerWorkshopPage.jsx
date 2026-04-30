import FormInput from "../component/common/FormInput";
import FormContainer from "../component/common/FormContainer";
import { useForm } from "react-hook-form";
import { Upload } from "lucide-react";
import { useRef } from "react";

const OrganizerWorkshopPage = () => {
  const { register, handleSubmit } = useForm();
  const fileInputRef = useRef(null);
  const { ref: registerRef, ...pdfRegisterRest } = register("pdfFile");
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <h1 className="font-bold text-2xl ">Create New Workshop</h1>
      <FormContainer className={"w-full h-fit px-5 py-4"}>
        <h2 className="font-bold text-xl mb-4 w-full">Workshop Details</h2>
        <div className="w-full flex flex-row gap-5 justify-center items-start">
          <div className="w-full flex flex-col gap-3">
            <FormInput label="Workshop Title">
              <input
                className="w-full border border-gray-500 focus:border-black rounded-md py-1 px-2"
                {...register("title")}
                placeholder="Unihub Workshop"
              />
            </FormInput>
            <FormInput label="Description">
              <textarea
                className="w-full h-full resize-none shrink border border-gray-500 focus:border-black rounded-md py-1 px-2"
                rows={7}
                placeholder="Workshop for Information Technology student"
                {...register("description")}
              />
            </FormInput>
            <div className="w-full flex flex-row gap-5 justify-between items-center">
              <FormInput label="Capacity">
                <input
                  className="w-full border border-gray-500 focus:border-black rounded-md py-1 px-2"
                  type="number"
                  {...register("capacity", {
                    validate: (value) =>
                      value > 0 || "Capacity must be positive number",
                  })}
                />
              </FormInput>
              <FormInput label="Price">
                <input
                  className="w-full border border-gray-500 focus:border-black rounded-md py-1 px-2"
                  type="number"
                  {...register("price", {
                    validate: (value) =>
                      value >= 0 || "Price can not be negative number",
                  })}
                />
              </FormInput>
            </div>
          </div>
          <div className="w-full flex flex-col gap-3 justify-start">
            <FormInput label="Room">
              <input
                className="w-full border border-gray-500 focus:border-black rounded-md py-1 px-2"
                {...register("room")}
              />
            </FormInput>
            <FormInput label="Start Time">
              <input
                className="w-full border border-gray-500 focus:border-black rounded-md py-1 px-2"
                type="datetime-local"
                {...register("startTime")}
              />
            </FormInput>
            <FormInput label="End Time">
              <input
                className="w-full border border-gray-500 focus:border-black rounded-md py-1 px-2"
                type="datetime-local"
                {...register("endTime")}
              />
            </FormInput>
            <FormInput
              label="PDF File Upload"
              className="flex items-center justify-center w-full"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="border border-dashed bg-gray-100 hover:bg-blue-100 active:bg-white rounded-xl w-full flex flex-col items-center justify-center pt-5 pb-4"
              >
                <Upload />
                <p className="mb-1 text-sm text-gray-500 font-semibold">
                  Click to upload
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG or PDF (MAX. 800x400px)
                </p>
              </button>

              <input
                className="hidden"
                type="file"
                {...pdfRegisterRest}
                ref={(e) => {
                  registerRef(e); // Connects to React Hook Form
                  fileInputRef.current = e; // Connects to your manual trigger
                }}
              />
            </FormInput>
          </div>
        </div>
      </FormContainer>
    </div>
  );
};

export default OrganizerWorkshopPage;
