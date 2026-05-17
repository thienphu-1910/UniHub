import WorkshopForm from "../component/common/WorkshopForm";
import Button from "../component/common/Button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateWorkshopPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full ">
      <Button
        className="max-w-fit py-1 flex flex-row gap-2 justify-center items-center mb-2"
        onClick={() => {
          navigate("/workshops");
        }}
      >
        <ArrowLeft />
        Back to Workshops
      </Button>
      <WorkshopForm />
    </div>
  );
};

export default CreateWorkshopPage;
