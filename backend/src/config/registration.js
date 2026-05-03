export const REGISTRATION_HOLD_TTL_SECONDS = 10 * 60;

export const MOCK_PAYMENT_URL_BASE =
  process.env.VIETQR_PAYMENT_URL_BASE || "https://vietqr.local/mock-payment";

export const buildMockPaymentUrl = ({
  registrationId,
  workshopId,
  studentId,
}) => {
  const params = new URLSearchParams({
    registrationId,
    workshopId: String(workshopId),
    studentId: String(studentId),
  });

  return `${MOCK_PAYMENT_URL_BASE}?${params.toString()}`;
};
