import { useEffect, useRef, useState } from "react";
import { formatToVND } from "../../utils/currency";
import Button from "./Button";
import { Spinner } from "flowbite-react";
import DisabledButton from "./DisabledButton";
import { registrationService } from "../../services/registrationService";
import PaymentQRDialog from "./PaymentQRDialog";
import { paymentService } from "../../services/paymentService";

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
            {status === "payment-processing" && (
              <DisabledButton className="bg-green-600">
                <Spinner />
              </DisabledButton>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const WorkshopRegistration = ({ workshopId, title, price }) => {
  // const [isLoading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const [show, setShow] = useState(false);
  const [registration, setRegistration] = useState({});
  //const [isProcessing, setProcess] = useState(false);

  const onRegister = async () => {
    setRegistration((r) => ({
      ...r,
      status: "processing",
    }));
    const { success, message } =
      await registrationService.registerWorkshop(workshopId);
    console.log(message);
    if (success) {
      setRegistration((r) => ({
        ...r,
        status: "pending",
      }));
    }
  };

  const onPayment = async () => {
    setShow(true);
  };

  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/registrations/${workshopId}/status`,
      { withCredentials: true },
    );

    eventSource.addEventListener("registration-status", (event) => {
      const parsedData = JSON.parse(event.data);
      setRegistration(parsedData);
      console.log(parsedData);
    });

    eventSource.onerror = (error) => {
      console.error("SSE connection failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [workshopId]);


  const onPayClick = async () => {
    setShow(false);
    try {
      const { registrationId, idempotencyKey } = registration;
      const result = await paymentService.payment(
        registrationId,
        idempotencyKey,
        price,
      );
      if (result) {
        setRegistration((r) => ({
          ...r,
          status: "payment-processing",
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
      <h2 className="w-full text-2xl font-bold text-slate-900">Registration</h2>

      <RegisterBar
        price={price}
        onRegister={onRegister}
        loading={registration.status === "processing"}
        status={registration.status}
        onPayment={onPayment}
      />

      {show && (
        <PaymentQRDialog
          title={title}
          price={price}
          qrurl={
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/960px-QR_code_for_mobile_English_Wikipedia.svg.png"
          }
          onCancel={() => setShow(false)}
          onPayClick={onPayClick}
        />
      )}
    </div>
  );
};

export default WorkshopRegistration;
