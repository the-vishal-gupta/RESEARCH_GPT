/**
 * Standardized API error format
 */
export interface ApiError {
  code: string; // 'NETWORK_ERROR', 'TIMEOUT', 'NOT_FOUND', 'RATE_LIMIT', 'INVALID_INPUT', 'SERVICE_UNAVAILABLE'
  message: string; // User-friendly message
  details?: string; // Technical details (dev only)
  timestamp: Date;
  retryable: boolean; // Can user retry?
  statusCode?: number; // HTTP status code if available
}

/**
 * Creates a standardized API error object
 * @param code - Error code identifier
 * @param message - User-friendly error message
 * @param retryable - Whether the operation can be retried
 * @param details - Technical details for debugging
 * @param statusCode - HTTP status code if available
 * @returns Standardized ApiError object
 */
export function createApiError(
  code: string,
  message: string,
  retryable: boolean = true,
  details?: string,
  statusCode?: number
): ApiError {
  return {
    code,
    message,
    details,
    timestamp: new Date(),
    retryable,
    statusCode
  };
}

/**
 * Determines if an error is retryable based on HTTP status code
 * @param statusCode - HTTP status code
 * @returns true if operation can be retried
 */
export function isRetryableStatus(statusCode?: number): boolean {
  if (!statusCode) return true;

  // Retry on: timeout, rate limit, service unavailable, bad gateway, gateway timeout
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(statusCode);
}

/**
 * Maps HTTP status codes to user-friendly error messages
 * @param statusCode - HTTP status code
 * @returns Error object with code and message
 */
export function getErrorFromStatusCode(statusCode: number): {
  code: string;
  message: string;
  retryable: boolean;
} {
  const errorMap: Record<number, { code: string; message: string; retryable: boolean }> = {
    400: {
      code: 'INVALID_INPUT',
      message: 'Please check your search query and try again',
      retryable: false
    },
    401: {
      code: 'UNAUTHORIZED',
      message: 'Please log in to continue',
      retryable: false
    },
    403: {
      code: 'FORBIDDEN',
      message: 'You do not have access to this resource',
      retryable: false
    },
    404: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      retryable: false
    },
    408: {
      code: 'TIMEOUT',
      message: 'Request took too long. Please try again',
      retryable: true
    },
    429: {
      code: 'RATE_LIMIT',
      message: 'Too many requests. Please wait a moment and try again',
      retryable: true
    },
    500: {
      code: 'SERVER_ERROR',
      message: 'Server error. Please try again later',
      retryable: true
    },
    502: {
      code: 'BAD_GATEWAY',
      message: 'Service temporarily unavailable. Please try again',
      retryable: true
    },
    503: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service temporarily unavailable. Please try again later',
      retryable: true
    },
    504: {
      code: 'GATEWAY_TIMEOUT',
      message: 'Request took too long. Please try again',
      retryable: true
    }
  };

  return errorMap[statusCode] || {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again',
    retryable: true
  };
}

/**
 * Detects error type from network error or exception
 * @param error - Error object
 * @returns Error summary with code, message, and retryable status
 */
export function detectErrorType(error: any): {
  code: string;
  message: string;
  retryable: boolean;
  details: string;
} {
  // Network error
  if (error?.message?.includes('Network') || error?.code === 'ECONNREFUSED') {
    return {
      code: 'NETWORK_ERROR',
      message: 'Check your internet connection and try again',
      retryable: true,
      details: error?.message || 'Network connection failed'
    };
  }

  // Timeout
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return {
      code: 'TIMEOUT',
      message: 'Request took too long. Please try again',
      retryable: true,
      details: error?.message || 'Request timeout'
    };
  }

  // Axios error with response
  if (error?.response?.status) {
    const statusError = getErrorFromStatusCode(error.response.status);
    return {
      ...statusError,
      details: error?.response?.data?.message || error?.message || ''
    };
  }

  // Axios error without response (network issue)
  if (error?.request && !error?.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the server. Please check your connection',
      retryable: true,
      details: 'No response from server'
    };
  }

  // Generic error
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again',
    retryable: true,
    details: error?.message || 'Unknown error'
  };
}

/**
 * Wraps API calls with error handling and retry logic
 * @param fn - Async function to execute
 * @param maxRetries - Maximum number of retry attempts
 * @param delayMs - Base delay between retries (exponential backoff)
 * @returns Result of function or ApiError
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T | ApiError> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const errorInfo = detectErrorType(error);

      // Don't retry non-retryable errors
      if (!errorInfo.retryable || attempt === maxRetries) {
        return createApiError(
          errorInfo.code,
          errorInfo.message,
          errorInfo.retryable,
          errorInfo.details,
          error?.response?.status
        );
      }

      // Exponential backoff
      const backoffDelay = delayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  // Fallback (should not reach here)
  return createApiError(
    'UNKNOWN_ERROR',
    'An unexpected error occurred',
    true,
    lastError?.message
  );
}

/**
 * Checks if value is an ApiError
 * @param value - Value to check
 * @returns true if value is an ApiError object
 */
export function isApiError(value: any): value is ApiError {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    value.timestamp instanceof Date &&
    typeof value.retryable === 'boolean'
  );
}
