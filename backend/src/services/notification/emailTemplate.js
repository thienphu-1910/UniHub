export const buildRegistrationSuccessEmail = ({ fullName, workshopTitle, room, quickChartUrl }) => {
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #222;">
      <h2>Xin chúc mừng, ${fullName}!</h2>
      <p>Bạn đã đăng ký thành công cho workshop: <strong>${workshopTitle}</strong>.</p>
      <p>Số phòng: <strong>${room}</strong></p>
      <p>Vui lòng lưu mã QR dưới đây để check-in tại sự kiện:</p>
      <img src="${quickChartUrl}" alt="QR Code" style="width:300px;height:300px;" />
      <p>Nếu có thắc mắc, hãy liên hệ với ban tổ chức.</p>
    </div>
  `;

  return {
    subject: `Đăng ký workshop thành công: ${workshopTitle}`,
    html,
  };
};

export default buildRegistrationSuccessEmail;
