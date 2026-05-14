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

export { formatDate };