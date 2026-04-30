import { set, useForm } from "react-hook-form";
import Button from "./Button";
import WorkshopDetailsForm from "./WorkshopDetailsForm";
import SpeakerForm from "./SpeakerForm";

const WorkshopForm = () => {
  const { register, handleSubmit, watch, setValue , formState: { errors }} = useForm();

  const onSubmit = async (data, e) => {
    e.preventDefault();
    console.log(data.speakerAvatar)
  }

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
