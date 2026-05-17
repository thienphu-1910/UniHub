import { useEffect, useState } from "react";
import { registrationService } from "../services/registrationService";
import { isWorkshopEmpty, saveWorkshopRegistrations } from "../lib/indexedDB";
const useConfirmedWorkshopRegistrations = (id) => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await registrationService.getWorkshopConfirmedRegistrations(id);
        const rawRegistrations = result?.registrations || [];
        console.log(result)
        const registrations = rawRegistrations.map((r) => ({
          ...r,
          isCheckin: false,
          checkinAt: null,
        }));

        if (isMounted) {
          setRegistrations(registrations);
          const isEmpty = await isWorkshopEmpty(id);
          if (isEmpty && registrations && registrations.length > 0) {
            await saveWorkshopRegistrations(id, registrations);
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
  }, [id]);

  return {
    registrations,
    isLoading,
    error,
  };
};

export default useConfirmedWorkshopRegistrations;
