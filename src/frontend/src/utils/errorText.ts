/**
 * Extract a readable English error string from unknown errors.
 * Handles nested/serialized backend error text.
 */
export function extractErrorText(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object
  if (error instanceof Error) {
    return error.message || 'An error occurred';
  }

  // If it's an object with a message property
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    
    // Check for message property
    if (typeof err.message === 'string') {
      return err.message;
    }

    // Check for error property (nested error)
    if (err.error) {
      return extractErrorText(err.error);
    }

    // Try to stringify the object
    try {
      const str = JSON.stringify(error);
      if (str && str !== '{}') {
        return str;
      }
    } catch {
      // Ignore stringify errors
    }
  }

  return 'An unknown error occurred';
}
