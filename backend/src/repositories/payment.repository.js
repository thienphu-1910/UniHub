import sql from "../config/db.js";
import { registrationStatuses, paymentStatuses } from "../enums/status.enum.js";

export const paymentRepository = {
    updatePaymentSuccess: async ({ registrationId, gateway, gatewayTxnId, gatewayResponse, qrCodeData, quickChartUrl }) => {
        try {
            await sql`
                UPDATE payments
                SET status = ${paymentStatuses.SUCCESS}, gateway = ${gateway}, gateway_txn_id = ${gatewayTxnId}, gateway_response = ${gatewayResponse}, updated_at = CURRENT_TIMESTAMP
                WHERE registration_id = ${registrationId}
            `;
            await sql`
                UPDATE registrations
                SET status = ${registrationStatuses.CONFIRMED}, confirmed_at = CURRENT_TIMESTAMP, qr_code = ${qrCodeData}, qr_code_url = ${quickChartUrl} 
                WHERE id = ${registrationId}
            `;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    updatePaymentFailed: async ({ registrationId, gateway, gatewayResponse}) => {
        try {
            await sql`
                UPDATE payments
                SET status = ${paymentStatuses.FAILED}, gateway = ${gateway}, gateway_response = ${gatewayResponse}, updated_at = CURRENT_TIMESTAMP
                WHERE registration_id = ${registrationId}   
            `;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
};
