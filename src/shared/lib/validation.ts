const ISBN_CHARACTERS_PATTERN = /^[0-9-]+$/;
const ISBN_SHORT_LENGTH = 10;
const ISBN_LONG_LENGTH = 13;

export const PHONE_PATTERN = /^\+7\d{10}$/;
export const PHONE_MAX_LENGTH = 12;

const PHONE_DIGITS_LENGTH = 11;
const PHONE_COUNTRY_CODE = '7';
const PHONE_LOCAL_TRUNK_CODE = '8';
const NON_DIGIT_PATTERN = /\D/g;

export function isValidIsbn(value: string): boolean {
  if (!ISBN_CHARACTERS_PATTERN.test(value)) {
    return false;
  }

  const digits = value.replace(/-/g, '');
  return digits.length === ISBN_SHORT_LENGTH || digits.length === ISBN_LONG_LENGTH;
}

export function normalizeFullName(fullName: string): string {
  return fullName.trim().replace(/\s+/g, ' ');
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(NON_DIGIT_PATTERN, '');
  if (digits.length === 0) {
    return '';
  }

  const hasCountryCode = digits.startsWith(PHONE_COUNTRY_CODE) || digits.startsWith(PHONE_LOCAL_TRUNK_CODE);
  const subscriberDigits = hasCountryCode ? digits.slice(1) : digits;
  return `+${PHONE_COUNTRY_CODE}${subscriberDigits.slice(0, PHONE_DIGITS_LENGTH - 1)}`;
}
