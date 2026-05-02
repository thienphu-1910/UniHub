import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { workshopService } from "../services/workshopService";
import Button from "../component/common/Button";
import WorkshopTable from "../component/common/WorkshopTable";
import Loading from "../component/common/Loading";

const WorkshopsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Lấy giá trị từ URL, nếu không có thì mặc định là 1 và 10
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workshops, setWorkshops] = useState([]);

  // 2. Hàm thay đổi trang (ví dụ khi nhấn nút Next)
  const handlePageChange = (newPage) => {
    setSearchParams({
      page: newPage.toString(),
      limit: limit,
    });
  };

  // 3. Theo dõi sự thay đổi của URL để gọi API
  useEffect(() => {
    let isMounted = true;
    const loadWorkshops = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await workshopService.getWorkshopList(Number.parseInt(page), Number.parseInt(limit));
        if (isMounted) {
          setWorkshops(response?.list ?? []);
          console.log(response)
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setError(e || "Unable to load workshops");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWorkshops();
    return () => {
      isMounted = false;
    }
    
  }, [page, limit]);


  return (
    <div className="w-full">
      {isLoading && (
        <Loading />
      )}
      {error && (
        <div className="text-red-500 font-semibold">Error: {error.message}</div>
      )}
      {!isLoading && !error && (
        <>
          <div className="w-full flex flex-row justify-between mb-4 items-baseline">
            <h1 className="font-bold text-3xl mb-3">Workshops</h1>
            <Button className="max-w-fit " onClick={() => {navigate('/create-workshops')}}>
              + Add new workshops
            </Button>
          </div>
          <div className="w-full">
            <WorkshopTable workshops={workshops} />
          </div>
        </>
      )}
    </div>
  );
};

export default WorkshopsPage;
