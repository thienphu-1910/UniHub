import sql from "../config/db.js";
import { registrationStatuses, paymentStatuses } from "../enums/status.enum.js";

export const paymentRepository = {
    updatePaymentSuccess: async ({ registrationId, gateway, gatewayTxnId, gatewayResponse }) => {
        try {
            await sql`
                UPDATE payments
                SET status = '${paymentStatuses.SUCCESS}', gateway = ${gateway}, gateway_txn_id = ${gatewayTxnId}, gateway_response = ${gatewayResponse}, updated_at = CURRENT_TIMESTAMP
                WHERE registration_id = ${registrationId}
            `;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    updatePaymentFailure: async ({ registrationId, gatewayResponse}) => {
        try {
            await sql`
                UPDATE payments
                SET status = '${paymentStatuses.FAILED}', gateway_response = ${gatewayResponse}, updated_at = CURRENT_TIMESTAMP
                WHERE registration_id = ${registrationId}   
            `;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
};
