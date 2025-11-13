/**
 * Centralized error handling utility
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle errors gracefully and show user-friendly messages
 */
export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    console.error('Error:', error);
    return error.message || 'An unexpected error occurred';
  }
  
  return 'An unexpected error occurred';
}

/**
 * Auto-save utility for forms
 */
export function createAutoSave<T>(
  saveFn: (data: T) => Promise<void>,
  delay: number = 1000
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastData: T | null = null;

  return (data: T) => {
    lastData = data;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      if (lastData) {
        try {
          await saveFn(lastData);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, delay);
  };
}

