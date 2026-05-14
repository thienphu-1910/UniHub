const registrationStatuses = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  CHECK_IN: 'check_in',
});

const paymentStatuses = Object.freeze({
  PENDING: 'peding',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
})

export { registrationStatuses, paymentStatuses };