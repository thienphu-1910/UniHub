const formatDate = (timestamp) => {
  const date = new Date(
    new Date(timestamp).toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
    }), // ✅
  );

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = String(hours % 12 || 12).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hours}:${minutes} ${ampm}`;
};

const formatToDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  
  // Create a date object to handle variations safely
  const date = new Date(isoString);
  
  // If the date is invalid, return an empty string fallback
  if (isNaN(date.getTime())) return "";

  // Shift to local time offset and format to YYYY-MM-DDTHH:mm
  const pad = (num) => String(num).padStart(2, '0');
  
  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const DD = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());

  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
};

export { formatDate, formatToDatetimeLocal };