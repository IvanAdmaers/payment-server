/**
 * This function returns an error object
 */
export const getErrorBody = (code: number, errorText: string) => ({
  success: false,
  error: {
    code,
    info: errorText,
  },
});
