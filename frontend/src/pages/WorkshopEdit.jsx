import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { workshopService } from "../services/workshopService";
import Button from "../component/common/Button";
import WorkshopDetailsForm from "../component/common/WorkshopDetailsForm";
import { useEffect, useState } from "react";
import { formatToDatetimeLocal } from "../utils/datetime";
import Loading from "../component/common/Loading";
import { ArrowLeft } from "lucide-react";

const WorkshopEdit = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  //const workshop = location.state?.workshop;
  const [workshop, setWorkshop] = useState(location.state?.workshop ?? {})
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadWorkshop = async () => {
      setLoading(true);
      setError(null);

      try {
        const workshopRes = await workshopService.getWorkshopDetail(id);

        if (isMounted) {
          setWorkshop(workshopRes?.workshop ?? {});
          console.log(workshopRes);
        }
      } catch (e) {
        if (isMounted) setError(e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (Object.keys(workshop).length === 0) {
      loadWorkshop();
    }

    return () => {
      isMounted = false;
    }
  }, [workshop, id]);
  
  const {
    description,
    capacity,
    room,
    startTime,
    endTime,
    registrationStartTime,
    registrationEndTime,
    title,
    price,
  } = workshop;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    values: {
      startTime: startTime ? formatToDatetimeLocal(startTime) : "",
      endTime: endTime ? formatToDatetimeLocal(endTime) : "",
      regStartTime: registrationStartTime ? formatToDatetimeLocal(registrationStartTime) :"",
      regEndTime: registrationEndTime ? formatToDatetimeLocal(registrationEndTime) : "",
      title: title ?? "",
      description: description ?? "",
      room: room ?? "",
      capacity: capacity ?? 0,
      price: price ?? 0,
    },
  });

  const onSubmit = async (data, e) => {
      e.preventDefault();
  
    const payload = {
      description: data.description || "",
      capacity: data.capacity,
      room: data.room,
      startTime: data.startTime,
      endTime: data.endTime,
      registrationStartTime: data.regStartTime,
      registrationEndTime: data.regEndTime,
      title: data.title,
      price: data.price || 0,
    };
    
      try {
        const { success, data } = await workshopService.updateWorkshop(id, payload);
        if (success && data) { 
          reset();
          navigate(`/workshops/${id}`);
        }
       
        //if (success && data) reset();
      } catch (e) {
        console.log(e);
      }
    };

  return (
    <>
      {loading && <Loading />}
      {error && (
        <div className="text-red-500 font-semibold">{error.message}</div>
      )}
      {!loading && !error && (
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <Button
            className="max-w-fit"
            onClick={() => {
              navigate(`/workshops/${id}`);
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workshop
          </Button>
          <h1 className="font-bold text-2xl ">Create New Workshop</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-3"
          >
            <WorkshopDetailsForm
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              getValues={getValues}
              edit={true}
            />

            <Button type="submit" className="w-full mt-5 active:scale-98">
              Update Workshop
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default WorkshopEdit;
 