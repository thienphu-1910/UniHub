const registrationStatuses = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  CHECKED_IN: 'checked_in',
});

const paymentStatuses = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
})

export { registrationStatuses, paymentStatuses };
