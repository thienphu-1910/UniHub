import { useRef, useState, } from "react";
import FormInput from "./FormInput";
import FormContainer from "./FormContainer";
import { User, X } from "lucide-react";

const SpeakerForm = ({ register, setValue, errors }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const {
    ref: registerRef,
    onChange: registerOnChange,
    ...imgRegisterRest
  } = register("speakerAvatar");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Giải phóng URL cũ nếu có để tránh rò rỉ bộ nhớ
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      // 2. Tạo URL mới và set state
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    // 3. Quan trọng: Gọi hàm onChange của React Hook Form để nó cập nhật giá trị vào form
    registerOnChange(e);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    // Reset giá trị trong form
    setValue("speakerAvatar", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <FormContainer className={"w-full h-fit px-5 py-4"}>
      <h2 className="font-bold text-xl mb-4 w-full">Speaker Information</h2>
      <div className="flex flex-row gap-10 justify-between items-start w-full">
        <div className="flex flex-col w-full gap-4">
          <FormInput
            label="Speaker Name"
            className="w-full border border-gray-500 focus:border-black rounded-md py-1 px-2"
            {...register("speakerName")}
            placeholder="Nguyen Van A"
          />
          <div className="flex flex-col gap-2 items-start justify-center">
            <h2 className="font-bold text-base">Speaker Bio</h2>
            <textarea
              className="w-full h-full resize-none shrink border border-gray-500 focus:border-black rounded-md py-1 px-2"
              rows={7}
              placeholder="From University of Science"
              {...register("speakerBio")}
            />
          </div>
        </div>

        <div className="flex-1 h-full flex flex-col items-start gap-10">
          <h2 className="font-bold text-base">Speaker Avatar</h2>
          <div className="relative self-center">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-40 h-40 border border-dashed bg-gray-100 hover:bg-blue-100 active:bg-white rounded-full flex flex-col items-center justify-center overflow-hidden"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <User size={48} strokeWidth={1} />
                  <span className="text-xs text-gray-500 mt-2">Upload</span>
                </div>
              )}
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg z-10"
                title="Remove image"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <input
            className="hidden"
            type="file"
            accept="image/*"
            {...imgRegisterRest}
            onChange={handleFileChange} // Sử dụng hàm xử lý mới ở đây
            ref={(e) => {
              registerRef(e);
              fileInputRef.current = e;
            }}
          />
        </div>
      </div>
    </FormContainer>
  );
};

export default SpeakerForm;
