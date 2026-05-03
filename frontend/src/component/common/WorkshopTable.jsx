import { formatDate } from "../../utils/datetime";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleUser,
} from "lucide-react";
import { formatToVND } from "../../utils/currency";

const WorkshopTable = ({ workshops }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4">
      <table
        className="w-full border-collapse"
        style={{ tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "22%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "12%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
              Title
            </th>
            <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
              Speaker
            </th>
            <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
              Price
            </th>
            <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
              <div className="flex items-center gap-1">
                <UserIcon /> Capacity
              </div>
            </th>
            <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
              <div className="flex items-center gap-1">
                <CalendarIcon /> Available
              </div>
            </th>
            <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
              Time
            </th>
            <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
              Room
            </th>
          </tr>
        </thead>
        <tbody>
          {workshops &&
            workshops.map((w) => {
              const isFull = w.availableSlots === 0;

              return (
                <tr
                  key={w.id}
                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                  onClick={() => navigate(`/workshops/${w.id}`)}
                >
                  {/* Title */}
                  <td className="py-3 px-3">
                    <span className="font-medium text-sm">{w.title}</span>
                  </td>

                  {/* Speaker */}
                  <td className="">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {w.speaker.avatarUrl ? (
                        <img
                          src={w.speaker.avatarUrl}
                          alt="Speaker avatar"
                          className="size-8 rounded-full border-blue-500 border-2"
                        />
                      ) : (
                        <div className="size-8">
                          <CircleUser size="32" />
                        </div>
                      )}
                      <span
                        className={`text-sm truncate text-blue-700 font-bold`}
                      >
                        {w.speakerName}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 text-sm font-medium text-blue-600">
                    {formatToVND(w.price)}
                  </td>

                  {/* Capacity */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <UserIcon />
                      {w.capacity}
                    </div>
                  </td>

                  {/* Available */}
                  <td className="py-3 px-3">
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${isFull ? "text-red-600" : "text-green-700"}`}
                    >
                      {isFull ? <XCircleIcon /> : <CheckCircleIcon />}
                      {w.availableSlots}
                    </div>
                  </td>

                  {/* Time */}
                  <td className="py-3 px-3 text-sm text-gray-700 whitespace-normal leading-snug">
                    {formatDate(w.startTime)}
                  </td>

                  {/* Room */}
                  <td className="py-3 px-3 text-sm text-gray-700 truncate">
                    {w.room}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default WorkshopTable