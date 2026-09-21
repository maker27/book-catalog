import { describe, expect, test } from 'vitest';

import { validateSubscriptionForm } from './subscriptionSchema';

describe('validateSubscriptionForm', () => {
  test('телефон принимается только в формате +7XXXXXXXXXX', () => {
    expect(validateSubscriptionForm('+79991234567')).toEqual({});
    expect(validateSubscriptionForm('89991234567').phone).toBeTruthy();
  });
});
