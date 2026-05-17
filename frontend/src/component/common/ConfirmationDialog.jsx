const ConfirmationDialog = ({
  title,
  content,
  onConfirm,
  onCancel,
  headerStyle = "bg-blue-600",
  confirmStyle = "bg-blue-600 hover:bg-blue-700",
}) => {
  return (
    <div className="w-full h-full z-50 fixed inset-0 bg-black/20 flex flex-row justify-center items-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className={`${headerStyle} px-6 py-4`}>
          <h2 className="text-white text-lg font-semibold tracking-tight">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-gray-600 text-sm leading-relaxed">
          {content}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${confirmStyle} transition-colors`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
