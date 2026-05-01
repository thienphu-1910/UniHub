import { useForm } from "react-hook-form";
import Button from "./Button";
import WorkshopDetailsForm from "./WorkshopDetailsForm";
import SpeakerForm from "./SpeakerForm";
import { workshopService } from "../../services/workshopService";

const WorkshopForm = () => {
  const { register, handleSubmit, watch, setValue , formState: { errors }, reset} = useForm();

  const onSubmit = async (data, e) => {
    e.preventDefault();
    const formData = new FormData();

    // 1. Đưa các trường phẳng vào
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("capacity", data.capacity);
    formData.append("price", data.price || 0);
    formData.append("room", data.room || "");
    formData.append("startTime", data.startTime);
    formData.append("endTime", data.endTime);

    formData.append("speakerName", data.speakerName || "");
    formData.append("speakerBio", data.speakerBio || "");

    if (data.speakerAvatar) {
      formData.append("avatar", data.speakerAvatar);
    }
    if (data.pdfFile) {
      formData.append("pdf", data.pdfFile);
    }

    try {
      const { success, data } = await workshopService.addNewWorkshop(formData);

      if (success && data) reset();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <h1 className="font-bold text-2xl ">Create New Workshop</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-3">
        <WorkshopDetailsForm register={register} watch={watch} setValue={setValue} errors={errors}/>
        <SpeakerForm register={register} setValue={setValue} errors={errors} />
        <Button type="submit" className="w-full mt-5 active:scale-98">
          Publish Workshop
        </Button>
      </form>
    </div>
  );
};

export default WorkshopForm;
