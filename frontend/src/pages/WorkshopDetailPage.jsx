import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { workshopService } from "../services/workshopService";
import Loading from "../component/common/Loading";
import { TicketPercent, Clock5, Building, Snowflake, UserStar, ArrowLeft } from "lucide-react";
import { formatDate } from "../utils/datetime";
import Button from "../component/common/Button";

const WorkshopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate()

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workshop, setWorkshop] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadWorkshopDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await workshopService.getWorkshopDetail(id);

        if (isMounted) {
          setWorkshop(response?.workshop ?? {});
          console.log(response);
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
    <>
      {isLoading && <Loading />}
      {error && (
        <div className="text-red-500 font-semibold">{error.message}</div>
      )}
      {!isLoading && !error && (
        <>
          <Button className="max-w-fit py-1 flex flex-row gap-2 justify-center items-center mb-2" onClick={() => {navigate('/workshops')}}>
            <ArrowLeft/>
            Back to Workshops
          </Button>
          <div className="w-full mb-4">
            <h2 className="font-bold text-3xl">Workshop Detail</h2>
          </div>
          <div className="w-full flex flex-col ">
            <div className="rounded-t-lg shadow-md border-b border-b-black/20 bg-gray-200/30 px-6 py-5 w-full flex flex-row justify-between">
              <h2 className="text-2xl font-bold">{workshop.title}</h2>
              <div className="flex flex-row gap-2 justify-center items-center">
                <TicketPercent />
                <span className="text-blue-600 font-bold text-lg">
                  {workshop.price} đ
                </span>
              </div>
            </div>
            <div className="w-full rounded-b-lg shadow-md bg-white flex flex-col justify-center items-center gap-3 px-4 py-4">
              <p>{workshop.description}</p>
              <div className="w-full grid grid-cols-3 justify-center gap-10">
                <div className="flex flex-row gap-2 font-bold text-lg items-center">
                  <div className="rounded-lg p-2 bg-sky-200/60">
                    <Clock5 />
                  </div>
                  <div className="flex flex-col ">
                    <span>Time</span>
                    <span className="font-semibold text-base">
                      {formatDate(workshop.startTime)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row gap-2 font-bold text-lg items-center">
                  <div className="rounded-lg p-2 bg-sky-200/60">
                    <Building />
                  </div>
                  <div className="flex flex-col ">
                    <span>Location</span>
                    <span className="font-semibold text-base">
                      {workshop.room}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col gap-2">
                <div className="bg-sky-50 rounded-lg border border-sky-100 flex flex-row gap-2 px-2 py-2">
                  <Snowflake color="#5b72e1" />
                  <span className="font-semibold">AI Summary</span>
                </div>
                <div className="bg-sky-50 rounded-lg border border-sky-100 flex flex-row gap-2 px-2 py-2">
                  <span>{workshop.aiSummary || "hey"}</span>
                </div>
              </div>
              <div className="w-full flex flex-col gap-2">
                <div className="bg-sky-50 rounded-lg border border-sky-100 flex flex-row gap-2 px-2 py-2">
                  <UserStar color="#5b72e1" />
                  <span className="font-semibold">Speaker Info</span>
                </div>
                <div className="bg-sky-50 rounded-lg border border-sky-100 flex flex-row gap-2 px-3 py-4">
                  <img
                    src={workshop?.speaker?.avatarUrl}
                    alt="Speaker Avatar"
                    className="size-10 rounded-lg"
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-bold">{workshop?.speaker?.name}</span>
                    <span className="font-normal">
                      {workshop?.speaker?.bio}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default WorkshopDetailPage;
