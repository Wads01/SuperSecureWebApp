import type { Handle, HandleServerError } from '@sveltejs/kit';
export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event);
};

/**
 * Catches any unhandled server error and returns a safe, generic message.
 * The real error is logged server-side only — never sent to the client.
 */
export const handleError: HandleServerError = ({ error }) => {
  console.error('[Server Error]', error);
  return { message: 'Something went wrong. Please try again later.' };
};
