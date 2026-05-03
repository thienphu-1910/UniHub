import { useEffect, useState } from "react";
import { formatToVND } from "../../utils/currency";
import Button from "./Button";

const WorkshopRegistration = ({ workshopId, price, }) => {
  const [registration, setRegistration] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('pending');

  const onRegister = async () => {

  }

  const onPayment = async () => {

  }

  useEffect(() => {
    let isMounted = true;

    const loadRegistrationStatus = async () => {
      try {
        //
      } catch (e) {
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRegistrationStatus();

    return () => {
      isMounted = false;
    }
  }, [])

  
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
      <h2 className="w-full text-2xl font-bold text-slate-900">Registration</h2>
      <div className="w-full ">
        <div className="flex flex-col gap-3 items-center">
          <div className="flex flex-col items-center">
            <h3 className="text-3xl font-bold text-blue-700">{formatToVND(price)}</h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              PER PARTICIPANT
            </span>
          </div>
          <Button
            onClick={onRegister}
          >Register</Button>
        </div>
      </div>
    </div>
  );
}

export default WorkshopRegistration