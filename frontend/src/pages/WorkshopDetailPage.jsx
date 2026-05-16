import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { workshopService } from "../services/workshopService";
import { registrationService } from "../services/registrationService";
import Loading from "../component/common/Loading";
import { ArrowLeft, SquarePen, Trash2 } from "lucide-react";
import Button from "../component/common/Button";
import WorkshopDetail from "../component/common/WorkshopDetail";
import RegisteredStudents from "../component/common/RegisteredStudents";
import { userStore } from "../store/useAuthStore";
import { userRoles } from "../utils/userRole";
import WorkshopRegistration from "../component/common/WorkshopRegistration";
import ConfirmationDialog from "../component/common/ConfirmationDialog";
import useWorkshopDetail from "../hooks/useWorkshopDetail";

const WorkshopDetailPage = () => {
  const user = userStore((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);  

  const { workshop, isLoading, error } = useWorkshopDetail(id);

  const handleDelete = async () => {
    const { success } = await workshopService.deleteWorkshop(id);
    if (success) {
      navigate("/workshops");
    }
  };

  const now = new Date();
  const regStartTime = new Date(workshop.registrationStartTime);
  const regEndTime = new Date(workshop.registrationEndTime);
  const isRegistrationOpen = (now >= regStartTime) && (now <= regEndTime)

  //const isRegistrationOpen = ()

  return (
    <div className="max-w-5xl mx-auto">
      {isLoading && <Loading />}

      {error && (
        <div className="text-red-500 font-semibold">{error.message}</div>
      )}

      {!isLoading && !error && (
        <div className="w-full h-full">
          <div className="relative flex flex-col gap-6 text-slate-800">
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
              <div className="flex flex-row justify-between">
                <h1 className="font-bold text-2xl text-slate-900">
                  Workshop Detail
                </h1>

                {user.role === userRoles.ORGANIZER && (
                  <div className="flex flex-row gap-5">
                    <Link
                      to={`/workshops/${id}/edit`}
                      state={{
                        workshop: {
                          title: workshop.title,
                          description: workshop.description,
                          capacity: workshop.capacity,
                          room: workshop.room,
                          startTime: workshop.startTime,
                          endTime: workshop.endTime,
                          registrationStartTime: workshop.registrationStartTime,
                          registrationEndTime: workshop.registrationEndTime,
                          price: workshop.price,
                        },
                      }}
                      className="rounded border border-blue-500 p-2 bg-blue-50/50 text-blue-600 flex flex-row gap-2 items-center justify-center shadow-sm hover:scale-102 active:scale-98 px-3 hover:bg-blue-200/40"
                    >
                      <SquarePen className="w-5 h-5" strokeWidth={1.5} />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShow(true)}
                      className="rounded border border-red-500 p-2 bg-red-50/50 text-red-600 flex flex-row gap-2 items-center justify-center shadow-sm hover:scale-102 active:scale-98 px-3 hover:bg-red-200/40"
                    >
                      <Trash2
                        className="w-5 h-5"
                        strokeWidth={1.5}
                        color="#e14747"
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Card */}
            <WorkshopDetail workshop={workshop} />

            {user.role === userRoles.ORGANIZER && (
              <RegisteredStudents workshopId={id} />
            )}
            {user.role === userRoles.STUDENT && isRegistrationOpen && (
              <WorkshopRegistration workshopId={id} price={workshop.price} />
            )}
          </div>
          {confirm}
          {show && (
            <ConfirmationDialog
              title={`Delete ${workshop.title}`}
              content={`Do you want to delete ${workshop.title}?`}
              onCancel={() => setShow(false)}
              onConfirm={() => handleDelete()}
              headerStyle="bg-red-600"
              confirmStyle="bg-red-600 hover:bg-red-700"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default WorkshopDetailPage;
