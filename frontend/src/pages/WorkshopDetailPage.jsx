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

const mockData = [
  {
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    registeredAt: "2024-05-04T01:00:00.000Z",
    status: "confirmed",
  },
  {
    fullName: "Trần Thị Bé",
    email: "tranthibe@yahoo.com",
    registeredAt: "2024-05-05T09:30:00.000Z",
    status: "pending",
  },
  {
    fullName: "Lê Hoàng Cường",
    email: "lhcuong.work@domain.vn",
    registeredAt: "2024-05-06T14:15:00.000Z",
    status: "confirmed",
  },
  {
    fullName: "Phạm Đại Dương",
    email: "daiduong_pham@outlook.com",
    registeredAt: new Date().toISOString(), // Lấy thời gian hiện tại ở định dạng ISO
    status: "pending",
  },
];

const WorkshopDetailPage = () => {
  const user = userStore((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workshop, setWorkshop] = useState({});
  const [students, setStudents] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadWorkshopDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const [workshopRes, registrationRes] = await Promise.all([
          workshopService.getWorkshopDetail(id),
          registrationService.getRegisteredStudents(id),
        ]);

        if (isMounted) {
          setWorkshop(workshopRes?.workshop ?? {});
          console.log(workshopRes);
          setStudents(registrationRes?.list ?? []);
          console.log(registrationRes);
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
            <RegisteredStudents students={mockData} />
          )}
        </div>
      )}
    </div>
  );
};

export default WorkshopDetailPage;
