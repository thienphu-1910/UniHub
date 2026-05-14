import { useEffect, useState } from "react";
import { formatToVND } from "../../utils/currency";
import Button from "./Button";
import { Spinner } from "flowbite-react";
import DisabledButton from "./DisabledButton";

const RegisterBar = ({ price, onRegister, loading = false }) => {
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
          <Button onClick={onRegister}>Register</Button>
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
  const [registration, setRegistration] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState("pending");
  const [isProcessing, setProcess] = useState(false);

  const onRegister = async () => {
    setProcess(true);
  };

  const onPayment = async () => {};

  useEffect(() => {
    let isMounted = true;

    const loadRegistrationStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        //
      } catch (e) {
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRegistrationStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
      <h2 className="w-full text-2xl font-bold text-slate-900">Registration</h2>

      {status === "pending" && (
        <RegisterBar
          price={price}
          onRegister={onRegister}
          loading={isProcessing}
        />
      )}
      {status === "confirmed" && (
        <PaymentBar onPayment={onPayment} price={price} />
      )}
    </div>
  );
};

export default WorkshopRegistration;
