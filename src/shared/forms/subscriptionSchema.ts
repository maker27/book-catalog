import { z } from 'zod';

export const PHONE_PATTERN = /^\+7\d{10}$/;
export const SUBSCRIPTION_FIELDS = ['author_id', 'phone'] as const;

export type SubscriptionFormErrors = Partial<Record<(typeof SUBSCRIPTION_FIELDS)[number], string>>;

export const subscriptionFormSchema = z.object({
  phone: z.string().trim().regex(PHONE_PATTERN, 'Телефон в формате +7XXXXXXXXXX'),
});

export function validateSubscriptionForm(phone: string): SubscriptionFormErrors {
  const result = subscriptionFormSchema.safeParse({ phone });
  if (result.success) {
    return {};
  }
  return { phone: result.error.issues[0]?.message };
}
