import { z } from 'zod';

export const initiatePaymentSchema = z.object({
    body: z.object({
        registrationId: z.string().uuid({ message: "Registration ID is not valid" }),
        amount: z.number().positive({ message: "Amount is not valid" }),
        idempotencyKey: z.string().min(10, { message: "Idempotency Key is not valid" })
    })
});