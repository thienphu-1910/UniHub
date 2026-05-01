import FormInput from "./FormInput";
import FormContainer from "./FormContainer";
import { Upload, FileText, X } from "lucide-react";
import { useRef } from "react";

const WorkshopDetailsForm = ({ register, watch, setValue, errors }) => {
  const fileInputRef = useRef(null);

  const pdfFile = watch("pdfFile");
  const currentFile = pdfFile && pdfFile.length > 0 ? pdfFile[0] : null;

  const { ref: registerRef, ...pdfRegisterRest } = register("pdfFile");

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setValue("pdfFile", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <FormContainer className={"w-full h-fit px-5 py-4"}>
      <div className="flex flex-col mb-4">
        <h2 className="font-bold text-xl w-full">Workshop Details</h2>
        <p3 className="font-semibold text-base text-red-500">
          Field with * is required
        </p3>
      </div>
      <div className="w-full flex flex-row gap-5 justify-center items-start">
        <div className="w-full flex flex-col gap-3">
          {/* Workshop Title - Required */}
          <div className="flex flex-col w-full">
            <FormInput
              label="Workshop Title"
              required={true}
              className={`w-full border rounded-md py-1 px-2 ${
                errors.title
                  ? "border-red-500"
                  : "border-gray-500 focus:border-black"
              }`}
              {...register("title", { required: "Workshop title is required" })}
              placeholder="Unihub Workshop"
            />
            {errors.title && (
              <span className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </span>
            )}
          </div>

          <div className="w-full flex flex-row gap-5 justify-between items-start">
            {/* Capacity - Required & > 0 */}
            <div className="flex flex-col w-full text-start">
              <FormInput
                label="Capacity"
                required={true}
                className={`w-full border rounded-md py-1 px-2 ${
                  errors.capacity
                    ? "border-red-500"
                    : "border-gray-500 focus:border-black"
                }`}
                type="number"
                {...register("capacity", {
                  required: "Capacity is required",
                  min: { value: 1, message: "Capacity must be greater than 0" },
                })}
              />
              {errors.capacity && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.capacity.message}
                </span>
              )}
            </div>

            {/* Price - >= 0 */}
            <div className="flex flex-col w-full text-start">
              <FormInput
                label="Price"
                className={`w-full border rounded-md py-1 px-2 ${
                  errors.price
                    ? "border-red-500"
                    : "border-gray-500 focus:border-black"
                }`}
                type="number"
                {...register("price", {
                  min: { value: 0, message: "Price cannot be negative" },
                })}
              />
              {errors.price && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.price.message}
                </span>
              )}
            </div>
          </div>

          {/* Description - Optional */}
          <div className="flex flex-col gap-2 items-start justify-center">
            <h2 className="font-bold text-base">Description</h2>
            <textarea
              className="w-full h-full resize-none shrink border border-gray-500 focus:border-black rounded-md py-1 px-2"
              rows={7}
              placeholder="Workshop for Information Technology student"
              {...register("description")}
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 justify-start text-start">
          {/* Room - Required */}
          <div className="flex flex-col w-full">
            <FormInput
              label="Room"
              required={true}
              className={`w-full border rounded-md py-1 px-2 ${
                errors.room
                  ? "border-red-500"
                  : "border-gray-500 focus:border-black"
              }`}
              {...register("room", { required: "Room is required" })}
            />
            {errors.room && (
              <span className="text-red-500 text-xs mt-1">
                {errors.room.message}
              </span>
            )}
          </div>

          {/* Start Time - Required */}
          <div className="flex flex-col w-full">
            <FormInput
              label="Start Time"
              required={true}
              className={`w-full border rounded-md py-1 px-2 ${
                errors.startTime
                  ? "border-red-500"
                  : "border-gray-500 focus:border-black"
              }`}
              type="datetime-local"
              {...register("startTime", { required: "Start Time is required" })}
            />
            {errors.startTime && (
              <span className="text-red-500 text-xs mt-1">
                {errors.startTime.message}
              </span>
            )}
          </div>
          {/* End Time - Required */}
          <div className="flex flex-col w-full">
            <FormInput
              label="End Time"
              required={true}
              className={`w-full border rounded-md py-1 px-2 ${
                errors.endTime
                  ? "border-red-500"
                  : "border-gray-500 focus:border-black"
              }`}
              type="datetime-local"
              {...register("endTime", { required: "End Time is required" })}
            />
            {errors.endTime && (
              <span className="text-red-500 text-xs mt-1">
                {errors.endTime.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 items-start justify-center w-full">
            <h2 className="font-bold text-base">PDF File Upload</h2>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className={`border border-dashed rounded-xl w-full flex flex-col items-center justify-center pt-5 pb-4 transition-colors ${
                currentFile
                  ? "bg-blue-50 border-blue-400"
                  : "bg-gray-100 hover:bg-blue-100"
              }`}
            >
              {currentFile ? (
                <div className="flex flex-row justify-center items-center gap-2 px-4 w-full">
                  <div className="relative">
                    <FileText size={40} className="text-blue-600" />
                    <div
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </div>
                  </div>
                  <div className="overflow-hidden text-start">
                    <p className="text-sm font-medium text-blue-800 truncate w-32">
                      {currentFile.name}
                    </p>
                    <p className="text-xs text-blue-500">
                      {(currentFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="text-gray-400" />
                  <p className="mb-1 text-sm text-gray-500 font-semibold">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-400">PDF document only</p>
                </>
              )}
            </button>

            <input
              className="hidden"
              type="file"
              accept=".pdf"
              {...pdfRegisterRest}
              ref={(e) => {
                registerRef(e);
                fileInputRef.current = e;
              }}
            />
          </div>
        </div>
      </div>
    </FormContainer>
  );
};

export default WorkshopDetailsForm;
