import {
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleUser,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WorkshopsPage = () => {
  const navigate = useNavigate();

  const workshops = [
    {
      id: 1,
      title: "Advanced Quantum Mechanics",
      speakerName: "Dr. Robert Chen",
      speakerAvatar:
        "https://res.cloudinary.com/dd7yjliz4/image/upload/v1777639548/avatars/f1sjbdf2cbwhw89ilxmw.png",
      price: 240,
      capacity: 45,
      availableSlots: 12,
      time: "09:00 AM - 12:30 PM",
      room: "Hall B-12",
    },
    {
      id: 2,
      title: "Macroeconomic Policy 2024",
      speakerName: "[Unknown Speaker]",
      price: 115,
      capacity: 30,
      availableSlots: 30,
      time: "02:00 PM - 05:00 PM",
      room: "Room 402",
    },
    {
      id: 3,
      title: "Digital Anthropology 101",
      speakerName: "[Unknown Speaker]",
      price: 90,
      capacity: 100,
      availableSlots: 0,
      time: "11:00 AM - 01:00 PM",
      room: "Online Center",
    },
  ];

  return (
    <div className="w-full">
      <h1 className="font-bold text-2xl mb-3">Workshops</h1>

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
            {workshops.map((w) => {
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
                      {w.speakerAvatar ? (
                        <img
                          src={w.speakerAvatar}
                          alt="Speaker avatar"
                          className="size-8 rounded-full border-blue-500 border-2"
                        />
                      ) : (
                        <div className="size-8">
                          <CircleUser size="32"/>
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
                    ${w.price.toFixed(2)}
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
                    {w.time}
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
    </div>
  );
};

export default WorkshopsPage;
