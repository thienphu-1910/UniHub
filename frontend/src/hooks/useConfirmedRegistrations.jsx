import { useEffect, useState } from "react";
import { registrationService } from "../services/registrationService";
import { isWorkshopEmpty, saveWorkshopRegistrations } from "../lib/indexedDB";
import { userStore } from "../store/useAuthStore";

const useConfirmedWorkshopRegistrations = (id, startTime, endTime) => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  const user = userStore((state) => state.user);

  useEffect(() => {
   

    let isMounted = true;

    const loadRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!startTime || !endTime) {
          setLoading(false);
          return;
        }

        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();

        // 2. CHECK THỜI GIAN TRONG LUỒNG AN TOÀN: Nếu nằm ngoài khung giờ, tắt loading và dừng lại
        if (now < start || now > end) {
          console.log(`[Hook] Ngoài khung giờ check-in.`);
          if (isMounted) {
            setLoading(false);
          }
          return; // Thoát hàm an toàn
        }

        const result =
          await registrationService.getWorkshopConfirmedRegistrations(id);
        const rawRegistrations = result?.registrations || [];
        console.log(result)
        const handledRegistrations = rawRegistrations.map((r) => ({
          ...r,
          isCheckin: false,
          checkinAt: null,
          staffId: user.userId
        }));

        if (isMounted) {
          setRegistrations(handledRegistrations);
          const isEmpty = await isWorkshopEmpty(id);
          console.log("IS DB EMPTY: ", isEmpty);
          console.log(handledRegistrations);
          if (isEmpty && handledRegistrations && handledRegistrations.length > 0) {
            await saveWorkshopRegistrations(id, handledRegistrations);
          }
        }
      } catch (e) {
        if (isMounted) {
          setError(e);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRegistrations();

    return () => {
      isMounted = false;
    };
  }, [id, startTime, endTime]);

  return {
    registrations,
    isLoading,
    error,
  };
};

export default useConfirmedWorkshopRegistrations;
