import { formatDate } from "../../utils/datetime";

// Component con cho từng Card cá nhân
const RegistrationCardItem = ({ student }) => {
  const { fullName, studentId, email, isCheckin, registeredAt } = student;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md">
      {/* Phần thông tin sinh viên */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">
            {fullName}
          </h3>
          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md shrink-0">
            {studentId}
          </span>
        </div>

        <p className="text-sm text-gray-500 truncate" title={email}>
          {email}
        </p>
      </div>

      {/* Phần trạng thái và thời gian */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-50 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Thời gian đăng ký:</span>
          <span className="font-medium text-gray-600">
            {formatDate(registeredAt)}
          </span>
        </div>

        {/* Trạng thái Check-in có bo góc và màu sắc động */}
        <div
          className={`w-full text-center py-2 rounded-lg font-medium text-sm transition-colors ${
            isCheckin
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {isCheckin ? "✓ Đã check-in" : "• Chưa check-in"}
        </div>
      </div>
    </div>
  );
};

const RegistrationCards = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Không có dữ liệu đăng ký nào được tìm thấy.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-y-auto p-4">
      {data.map((student, index) => (
        <RegistrationCardItem
          key={student.studentId || index}
          student={student}
        />
      ))}
    </div>
  );
};

export default RegistrationCards;
