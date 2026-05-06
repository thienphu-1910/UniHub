import { useState } from "react";
import Button from "../component/common/Button";
import { ScanLine, CircleCheck, CircleX } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

const CheckinStatus = ({ status, studentName, studentId }) => {
  return (
    <>
      {status === "successful" && (
        <div className="px-5 py-5 size-full flex flex-row gap-3 rounded-lg border-green-500 border bg-green-100">
          <div className="h-fit w-fit bg-green-300 p-3 rounded-lg">
            <CircleCheck color="#0ec432" />
          </div>
          <div className="flex flex-col h-fit">
            <h2 className="font-bold text-xl text-green-400">
              Check-in Successful
            </h2>
            <span className="font-bold text-base">{studentName}</span>
            <span className="font-semibold text-slate-500 text-base">
              Student ID: {studentId}
            </span>
          </div>
        </div>
      )}
      {status === "fail" && (
        <div className="px-5 py-5 size-full flex flex-row gap-3 rounded-lg border-red-500 border bg-red-100">
          <div className="h-fit w-fit bg-red-300 p-3 rounded-lg">
            <CircleX color="#c40e3b" />
          </div>
          <div className="flex flex-col h-fit">
            <h2 className="font-bold text-xl text-red-400">Check-in Fail</h2>
          </div>
        </div>
      )}
      {status === "normal" && (
        <div className="px-5 py-5 size-full flex flex-row gap-3 rounded-lg border-white border bg-white">
          <div className="h-fit w-fit bg-slate-300 p-3 rounded-lg">
            <ScanLine />
          </div>
          <div className="flex flex-col h-fit">
            <h2 className="font-bold text-xl text-black">Open Camera and Scan QR code</h2>
          </div>
        </div>
      )}
    </>
  );
};

const CheckinPage = () => {
  const [open, setOpen] = useState(false);

  const handleScan = (detectedCodes) => {
    console.log('Detected codes:', detectedCodes);
    // detectedCodes is an array of IDetectedBarcode objects
    detectedCodes.forEach(code => {
      console.log(`Format: ${code.format}, Value: ${code.rawValue}`);
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between mb-4 items-baseline">
      <h1 className="font-bold text-3xl mb-3">Workshop Check-in</h1>{" "}
      <div className="w-full h-full grid grid-cols-2 gap-5">
        <div className="h-full w-full flex flex-col gap-5 bg-white border border-gray-200 rounded-xl px-5 py-4">
          <div className=" flex flex-row justify-between items-start">
            <h2 className="font-bold text-xl">Scanner Ready</h2>
            <Button className="w-fit" onClick={() => setOpen(!open)}>
              {open ? "Close Camera" : "Open Camera"}
            </Button>
          </div>
          <div className="flex flex-row justify-center items-center h-full w-full bg-blue-50/50 border-2 border-blue-700 rounded-lg">
            {open ? (
              <Scanner
                scanDelay={300}
                onScan={handleScan}
                onError={(error) => console.error(error)}
                classNames={{
                  // Applying scale-x-[-1] mirrors the video back to "natural" orientation
                  video: "h-full w-full object-cover scale-x-[-1]",
                }}
                // constraints={{
                //   facingMode: "user", // Use rear camera
                //   aspectRatio: 1, // Square aspect ratio
                //   // Advanced constraints
                //   width: { ideal: 1920 },
                //   height: { ideal: 1080 },
                // }}
              />
            ) : (
              <ScanLine size={200} strokeWidth={0.5} color="#4c07ed" />
            )}
          </div>
        </div>
        <div className="w-full grid grid-rows-8 gap-5">
          <div className="w-full h-full row-span-2 border border-gray-200 rounded-lg">
            <CheckinStatus
              status="normal"
              studentName={"Phu Truong"}
              studentId={"23127455"}
            />
          </div>
          <div className="flex flex-col w-full row-span-6 border border-gray-200 rounded-lg">
            <div className="w-full h-fit px-5 py-5 bg-slate-100 border-b border-b-gray-300 shadow-sm rounded-t-lg flex flex-row justify-between items-center">
              <h2 className="font-bold text-lg">Recent Check-ins</h2>
              <span className="font-normal text-sm text-slate-500">
                Latest first
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinPage;
