import { X } from "lucide-react";

const QRCodeDialog = ({ isOpen, onClose, title, qrCodeUrl }) => {
  // Nếu state isOpen là false thì không render dialog
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop/Overlay - Làm mờ nền phía sau */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all border border-gray-100 flex flex-col items-center">
        {/* Nút X thoát ra ngoài ở góc phải trên cùng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Title của Dialog */}
        <h3 className="w-full text-center text-lg font-semibold text-gray-900 pr-6 pl-6 mb-6 line-clamp-2">
          Mã check-in cho sự kiện {title}
        </h3>

        {/* Khung chứa ảnh QR Code */}
        <div className="relative flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 w-64 h-64 shadow-inner">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`Mã QR check-in sự kiện ${title}`}
              className="w-full h-full object-contain max-w-[220px] max-h-[220px]"
              loading="lazy"
            />
          ) : (
            <div className="text-sm text-gray-400 animate-pulse">
              Đang tải mã QR...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeDialog;
