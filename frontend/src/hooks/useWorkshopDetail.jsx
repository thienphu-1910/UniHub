import { useEffect, useState } from "react";
import { workshopService } from "../services/workshopService";

const useWorkshopDetail = (id, isOnline=true) => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workshop, setWorkshop] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadWorkshopDetail = async () => {
      setLoading(true);
      setError(null);
      if (isOnline === false) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      try {
        const workshopRes = await workshopService.getWorkshopDetail(id);

        if (isMounted) {
          setWorkshop(workshopRes?.workshop ?? {});
          console.log(workshopRes.workshop);
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

  return { workshop, isLoading, error };
}

export default useWorkshopDetail;