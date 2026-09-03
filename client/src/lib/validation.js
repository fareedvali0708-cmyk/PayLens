/**
 * Client-side validation utilities matching backend Zod schemas.
 * Provides instant feedback before submitting forms.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RAZORPAY_KEY_REGEX = /^rzp_(test|live)_[a-zA-Z0-9]+$/;

/**
 * Validate Login Form
 * @param {{ email?: string, password?: string }} values
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateLogin(values) {
  const errors = {};
  const email = (values.email || '').trim();
  const password = values.password || '';

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address (e.g. name@company.com).';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Sign Up Form
 * @param {{ businessName?: string, email?: string, password?: string }} values
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateSignUp(values) {
  const errors = {};
  const businessName = (values.businessName || '').trim();
  const email = (values.email || '').trim();
  const password = values.password || '';

  if (!businessName) {
    errors.businessName = 'Business name is required.';
  } else if (businessName.length < 2) {
    errors.businessName = 'Business name must be at least 2 characters long.';
  } else if (businessName.length > 100) {
    errors.businessName = 'Business name cannot exceed 100 characters.';
  }

  if (!email) {
    errors.email = 'Work email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid work email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  } else if (password.length > 128) {
    errors.password = 'Password cannot exceed 128 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Merchant Settings Form
 * @param {{ businessName?: string, razorpayKeyId?: string, razorpayKeySecret?: string, webhookSecret?: string }} values
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateSettings(values) {
  const errors = {};
  const businessName = (values.businessName || '').trim();
  const razorpayKeyId = (values.razorpayKeyId || '').trim();
  const razorpayKeySecret = (values.razorpayKeySecret || '').trim();
  const webhookSecret = (values.webhookSecret || '').trim();

  if (!businessName) {
    errors.businessName = 'Business name is required.';
  } else if (businessName.length < 2) {
    errors.businessName = 'Business name must be at least 2 characters long.';
  } else if (businessName.length > 100) {
    errors.businessName = 'Business name cannot exceed 100 characters.';
  }

  if (razorpayKeyId) {
    if (!RAZORPAY_KEY_REGEX.test(razorpayKeyId)) {
      errors.razorpayKeyId =
        'Razorpay Key ID must start with rzp_test_ or rzp_live_ followed by alphanumeric characters.';
    }
  }

  if (razorpayKeySecret) {
    if (razorpayKeySecret.length < 8) {
      errors.razorpayKeySecret = 'Razorpay Key Secret must be at least 8 characters long.';
    }
  }

  if (webhookSecret) {
    if (webhookSecret.length < 8) {
      errors.webhookSecret = 'Webhook Secret must be at least 8 characters long.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
