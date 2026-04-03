// List of trusted email domains
export const TRUSTED_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "outlook.es",
  "hotmail.com",
];

/**
 * Checks if the given email has a valid format.
 * @param email - The email address to validate
 * @returns true if the email format is valid, false otherwise
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

/**
 * Checks if the given email belongs to a trusted domain.
 * @param email - The email address to check
 * @returns true if the email domain is trusted, false otherwise
 */
export function isTrustedEmail(email: string): boolean {
  if (!isValidEmail(email)) return false;

  const domain = email.split("@")[1].toLowerCase();
  return TRUSTED_EMAIL_DOMAINS.includes(domain);
}
