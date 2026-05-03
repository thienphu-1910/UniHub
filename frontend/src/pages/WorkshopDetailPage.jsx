import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { workshopService } from "../services/workshopService";
import { registrationService } from "../services/registrationService";
import Loading from "../component/common/Loading";
import { ArrowLeft } from "lucide-react";
import Button from "../component/common/Button";
import WorkshopDetail from "../component/common/WorkshopDetail";
import RegisteredStudents from "../component/common/RegisteredStudents";
import { userStore } from "../store/useAuthStore";
import { userRoles } from "../utils/userRole";
import WorkshopRegistration from "../component/common/WorkshopRegistration";

const WorkshopDetailPage = () => {
  const user = userStore((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workshop, setWorkshop] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadWorkshopDetail = async () => {
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
    };

    loadWorkshopDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto">
      {isLoading && <Loading />}

      {error && (
        <div className="text-red-500 font-semibold">{error.message}</div>
      )}

      {!isLoading && !error && (
        <div className="flex flex-col gap-6 text-slate-800">
          {/* Header & Navigation */}
          <div className="flex flex-col gap-4">
            <Button
              className="max-w-fit"
              onClick={() => {
                navigate("/workshops");
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workshops
            </Button>
            <h1 className="font-bold text-2xl text-slate-900">
              Workshop Detail
            </h1>
          </div>

          {/* Main Content Card */}
          <WorkshopDetail workshop={workshop} />

          {user.role === userRoles.ORGANIZER && (
            <RegisteredStudents workshopId={id} />
          )}
          {user.role === userRoles.STUDENT && (
            <WorkshopRegistration workshopId={id} price={workshop.price}/>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkshopDetailPage;
