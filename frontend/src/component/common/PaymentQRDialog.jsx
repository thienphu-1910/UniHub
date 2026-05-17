import { useState } from "react";

/**
 * PaymentQRDialog Component
 *
 * @param {string}   title        - Tên workshop
 * @param {number}   price        - Số tiền thanh toán
 * @param {string}   qrurl        - URL ảnh mã QR
 * @param {function} onPayClick   - Callback khi bấm nút thanh toán
 * @param {function} onCancel     - Callback khi bấm nút X đóng dialog
 */
export default function PaymentQRDialog({
  title,
  price,
  qrurl,
  onPayClick,
  onCancel,
}) {
  const [imgError, setImgError] = useState(false);

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      {/* Dialog card */}
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="pt-10 pb-4 px-6 text-center border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Payment to workshop
          </p>
          <h2 className="text-lg font-bold text-gray-800 leading-snug line-clamp-2">
            {title}
          </h2>
        </div>

        {/* Price */}
        <div className="py-4 text-center">
          <span className="text-3xl font-extrabold text-green-600 tracking-tight">
            {formattedPrice}
          </span>
        </div>

        {/* QR Code */}
        <div className="flex justify-center px-8 pb-6">
          <div className="p-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
            {!imgError ? (
              <img
                src={qrurl}
                alt="QR Code thanh toán"
                className="w-48 h-48 object-contain rounded-lg"
                onError={() => setImgError(true)}
              />
            ) : (
              /* Fallback khi ảnh lỗi */
              <div className="w-48 h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3M18 21v-3" />
                </svg>
                <span className="text-xs text-center">
                  Không tải được mã QR
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-400 -mt-2 pb-4 px-6">
          Quét mã QR bằng app ngân hàng hoặc bấm nút bên dưới
        </p>

        {/* Pay button */}
        <div className="px-6 pb-6">
          <button
            onClick={onPayClick}
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 text-white font-semibold text-base tracking-wide transition-all duration-150 shadow-md shadow-green-200"
          >
            Thanh toán ngay
          </button>
        </div>
      </div>
    </div>
  );
}
