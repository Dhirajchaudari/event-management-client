const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RsvpFormValues {
  name: string;
  email: string;
  specialty: string;
}

export interface RsvpFormErrors {
  name?: string;
  email?: string;
}

export function normalizeRsvpEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateRsvpEmail(
  email: string,
  existingEmails: string[] = []
): string | undefined {
  const normalized = normalizeRsvpEmail(email);

  if (!normalized) {
    return "Email is required";
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return "Enter a valid email address";
  }

  if (existingEmails.some((existing) => existing.toLowerCase() === normalized)) {
    return "This email has already RSVP'd to this event";
  }

  return undefined;
}

export function validateRsvpName(name: string): string | undefined {
  if (!name.trim()) {
    return "Name is required";
  }
  return undefined;
}

export function validateRsvpForm(
  values: RsvpFormValues,
  existingEmails: string[] = []
): RsvpFormErrors {
  const nameError = validateRsvpName(values.name);
  const emailError = validateRsvpEmail(values.email, existingEmails);

  return {
    ...(nameError ? { name: nameError } : {}),
    ...(emailError ? { email: emailError } : {})
  };
}

export function mapRsvpServerError(message: string): RsvpFormErrors {
  const lower = message.toLowerCase();

  if (lower.includes("email") || lower.includes("rsvp")) {
    return { email: message };
  }

  if (lower.includes("name")) {
    return { name: message };
  }

  return {};
}
