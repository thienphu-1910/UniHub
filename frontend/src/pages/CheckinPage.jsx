import { useState } from "react";
import Button from "../component/common/Button";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useCallback, } from "react";
import useWorkshopDetail from "../hooks/useWorkshopDetail";
import { useNavigate, useParams } from "react-router-dom";
import WorkshopDetail from "../component/common/WorkshopDetail";
import { decrypt } from "../utils/decrypt";
import Loading from "../component/common/Loading";
import useConfirmedWorkshopRegistrations from "../hooks/useConfirmedRegistrations";
import { checkIn, } from "../lib/indexedDB";
import { checkinService } from "../services/checkinService";
import CheckinTabs from "../component/common/CheckinTabs";
import { ArrowLeft } from "lucide-react";


const CheckinPage = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  const { id } = useParams();

  const isOnline = useOnlineStatus();
  //console.log(isOnline);

  const {
    workshop,
    isLoading: workshopLoading,
    error: workshopError,
  } = useWorkshopDetail(id, isOnline);
  //console.log(workshop)

  const {
    registrations,
    isLoading: registrationsLoading,
    error: registrationsError,
  } = useConfirmedWorkshopRegistrations(id, workshop?.startTime, workshop?.endTime, isOnline);

  //console.log(registrations)

  const handleScan = useCallback(
    async (detectedCodes) => {
      if (!detectedCodes || detectedCodes.length === 0) return;

      const scannedValue = detectedCodes[0].rawValue;
      const decodedValue = await decrypt(scannedValue);
      console.log(decodedValue);
      
      if (isOnline) {
        console.log(
          `Online: Sending check-in for ${scannedValue} directly to database.`,
        );
        try {
          const success = await checkinService.checkin(decodedValue, id);
        } catch (e) {
          console.log(e);
        } finally {
          await checkIn(id, decodedValue);
        }
      } else {
        await checkIn(id, decodedValue);
      }

      
    },
    [id, isOnline],
  );

  return (
    <>
      {(workshopLoading || registrationsLoading) && <Loading />}
      {(workshopError || registrationsError) && (
        <div className="text-red-500 font-semibold">
          {workshopError?.message} || {registrationsError?.message}
        </div>
      )}
      {!workshopLoading &&
        !registrationsLoading &&
        !workshopError &&
        !registrationsError && (
          <div className="w-full h-full flex flex-col justify-between mb-4 items-baseline">
            <Button
              className="max-w-fit py-1 flex flex-row gap-2 justify-center items-center mb-2"
              onClick={() => {
                navigate("/workshops");
              }}
            >
              <ArrowLeft />
              Back to Workshops
            </Button>
            <h1 className="font-bold text-3xl mb-3">Workshop Check-in</h1>
            <div className="w-full h-full flex flex-col items-center justify-center gap-5">
              <WorkshopDetail workshop={workshop} />

              <CheckinTabs workshopId={id} open={open} handleScan={handleScan} handleOpenCloseCamera={() => setOpen(!open)}/>
            </div>
          </div>
        )}
    </>
  );
};

export default CheckinPage;
