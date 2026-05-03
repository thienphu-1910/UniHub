const formatToVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

console.log(formatToVND(1234567));
// Output: "1.234.567 ₫"

console.log(formatToVND(1234567.89));
// Output: "1.234.567,89 ₫"

export { formatToVND };