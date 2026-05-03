import { useEffect, useState } from "react";
import { formatDate } from "../../utils/datetime";
import { registrationService } from "../../services/registrationService";
import Loading from "./Loading";

// const mockData = [
//   {
//     fullName: "Nguyễn Văn A",
//     email: "nguyenvana@gmail.com",
//     registeredAt: "2024-05-04T01:00:00.000Z",
//     status: "confirmed",
//   },
//   {
//     fullName: "Trần Thị Bé",
//     email: "tranthibe@yahoo.com",
//     registeredAt: "2024-05-05T09:30:00.000Z",
//     status: "pending",
//   },
//   {
//     fullName: "Lê Hoàng Cường",
//     email: "lhcuong.work@domain.vn",
//     registeredAt: "2024-05-06T14:15:00.000Z",
//     status: "confirmed",
//   },
//   {
//     fullName: "Phạm Đại Dương",
//     email: "daiduong_pham@outlook.com",
//     registeredAt: new Date().toISOString(), // Lấy thời gian hiện tại ở định dạng ISO
//     status: "pending",
//   },
// ];

const RegisteredStudents = ({ workshopId }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filter, setFilter] = useState(0);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterType = {
    1: 'pending',
    2: 'confirmed'
  }

  const handleFilter = (type) => {
    setFilter(type);
    if (type === 0) setStudents(students);
    else {
      setFilteredStudents(students.filter((s) => s.status === filterType[type]));
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadRegisteredStudents = async () => {
      try {
        const response = await registrationService.getRegisteredStudents(workshopId);

        if (isMounted) {
          setStudents(response?.list ?? []);
          setFilter(response?.list ?? []);
        }
      } catch (e) {
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRegisteredStudents();

    return () => {
      isMounted = false;
    }
  }, [workshopId]);

  return (
    <>
      {isLoading && <Loading />}
      {error && (
        <div className="text-red-600 font-bold text-xl">{error.message}</div>
      )}
      {!isLoading && !error && (
        <div className="w-full bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
          <h2 className="w-full text-2xl font-bold text-slate-900">
            Registered Students
          </h2>
          <div className="flex flex-row gap-2 justify-start">
            <button
              className={`hover:scale-102 active:scale-98 px-3 py-1 rounded-lg font-semibold ${filter === 0 ? "bg-indigo-300" : "bg-indigo-50"}`}
              type="button"
              onClick={() => handleFilter(0)}
            >
              All
            </button>
            <button
              className={`hover:scale-102 active:scale-98 px-3 py-1 rounded-lg font-semibold ${filter === 1 ? "bg-indigo-300" : "bg-indigo-50"}`}
              type="button"
              onClick={() => handleFilter(1)}
              type="button"
            >
              Paid
            </button>
            <button
              className={`hover:scale-102 active:scale-98 px-3 py-1 rounded-lg font-semibold ${filter === 2 ? "bg-indigo-300" : "bg-indigo-50"}`}
              type="button"
              onClick={() => handleFilter(2)}
              type="button"
            >
              Unpaid
            </button>
          </div>
          <div className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4">
            <table
              className="w-full border-collapse"
              style={{ tableLayout: "fixed" }}
            >
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
                    Student Name
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
                    Email
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
                    Registered Date
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 pb-3 px-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents &&
                  filteredStudents.map((s) => {
                    return (
                      <tr
                        key={s.userId}
                        className="border-b border-gray-100 hover:bg-blue-50"
                      >
                        <td className="py-3 px-3">
                          <span className="font-medium text-sm">
                            {s?.fullName}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-sm">
                            {s?.email}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-sm">
                            {formatDate(s?.registeredAt)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {s?.status === "pending" && (
                            <div className="px-3 py-1 w-fit bg-orange-200 rounded-lg text-orange-600">
                              Unpaid
                            </div>
                          )}
                          {s?.status === "confirmed" && (
                            <div className="px-3 py-1 w-fit bg-green-200 rounded-lg text-green-600">
                              Paid
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisteredStudents;
