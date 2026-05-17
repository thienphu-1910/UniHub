import { useEffect, useState } from "react";
import { formatToVND } from "../../utils/currency";
import Button from "./Button";
import { Spinner } from "flowbite-react";
import DisabledButton from "./DisabledButton";
import { registrationService } from "../../services/registrationService";

const RegisterBar = ({
  price,
  onRegister,
  loading = false,
  status,
  onPayment,
}) => {
  return (
    <div className="w-full ">
      <div className="flex flex-col gap-3 items-center">
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-bold text-blue-700">
            {formatToVND(price)}
          </h3>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
            PER PARTICIPANT
          </span>
        </div>
        {loading ? (
          <DisabledButton>
            <Spinner />
          </DisabledButton>
        ) : (
          <>
            {status === null && <Button onClick={onRegister}>Register</Button>}
            {status === "pending" && (
              <Button onClick={onPayment} variant="payment">
                Pay
              </Button>
            )}
            {status === "confirmed" && <div></div>}
          </>
        )}
      </div>
    </div>
  );
};

const PaymentBar = ({ onPayment, price }) => {
  return (
    <div className="w-full py-5 px-4 bg-emerald-200/30 rounded-lg border border-green-500 flex flex-row">
      <div className="w-full flex flex-col justify-start items-start">
        <h2 className="text-2xl font-bold">Registration successful!</h2>
        <p className="text-base font-normal">
          Please complete your payment to secure your spot.
        </p>
        {/* Put the countdown lock here*/}
      </div>
      <div className="w-full flex flex-row gap-6 justify-end items-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-2xl font-bold">{formatToVND(price)}</h2>
          <span className="uppercase text-base text-slate-400 font-normal">
            per participant
          </span>
        </div>
        <div>
          <Button className="w-fit px-8 py-1" onClick={onPayment}>
            Pay Now
          </Button>
        </div>
      </div>
    </div>
  );
};

const WorkshopRegistration = ({ workshopId, price }) => {
  // const [isLoading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const [status, setStatus] = useState(null);
  //const [isProcessing, setProcess] = useState(false);

  const onRegister = async () => {
    setStatus('processing');
    const { success, message } = await registrationService.registerWorkshop(workshopId);    
    console.log(message);
    if (success) {
      setStatus('pending');      
    }
  };

  const onPayment = async () => {};

  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/registrations/${workshopId}/status`,
      { withCredentials: true },
    );

    eventSource.addEventListener('registration-status', (event) => {
      const parsedStatus = JSON.parse(event.data);
      console.log(parsedStatus)
      setStatus(parsedStatus.status);

    })

    eventSource.onerror = (error) => {
      console.error("SSE connection failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [workshopId]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
      <h2 className="w-full text-2xl font-bold text-slate-900">Registration</h2>

      <RegisterBar
        price={price}
        onRegister={onRegister}
        loading={status === 'processing'}
        status={status}
        onPayment={onPayment}
      />

      {status === "confirmed" && (
        <PaymentBar onPayment={onPayment} price={price} />
      )}
    </div>
  );
};

export default WorkshopRegistration;
