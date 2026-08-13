const axios = require('axios');

const SANDBOX_BASE_URL = 'https://sandbox.cashfree.com/pg';
const PRODUCTION_BASE_URL = 'https://api.cashfree.com/pg';

class CashfreeConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CashfreeConfigError';
  }
}

function detectKeyEnvironment(secretKey = '') {
  if (secretKey.includes('_prod_')) {
    return 'production';
  }

  if (secretKey.includes('_test_') || secretKey.includes('_sandbox_')) {
    return 'sandbox';
  }

  return null;
}

function getCashfreeEnvironment() {
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const keyEnvironment = detectKeyEnvironment(secretKey);
  const configuredEnvironment = process.env.CASHFREE_ENV;

  if (configuredEnvironment === 'production' || configuredEnvironment === 'sandbox') {
    if (keyEnvironment && keyEnvironment !== configuredEnvironment) {
      console.warn(
        `Cashfree warning: CASHFREE_ENV=${configuredEnvironment} does not match your secret key (${keyEnvironment}). Using ${keyEnvironment}.`
      );
      return keyEnvironment;
    }

    return configuredEnvironment;
  }

  return keyEnvironment || 'sandbox';
}

function getCashfreeBaseUrl() {
  const environment = getCashfreeEnvironment();
  const configuredUrl = process.env.CASHFREE_BASE_URL;

  if (!configuredUrl) {
    return environment === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
  }

  const isProductionUrl = configuredUrl.includes('api.cashfree.com');
  const isSandboxUrl = configuredUrl.includes('sandbox.cashfree.com');

  if (environment === 'sandbox' && isProductionUrl) {
    return SANDBOX_BASE_URL;
  }

  if (environment === 'production' && isSandboxUrl) {
    return PRODUCTION_BASE_URL;
  }

  return configuredUrl.replace(/\/$/, '');
}

function getCashfreeCredentials() {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();

  if (!appId || !secretKey) {
    throw new CashfreeConfigError(
      'Cashfree credentials missing. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in Backend/.env'
    );
  }

  return { appId, secretKey };
}

function getCashfreeHeaders() {
  const { appId, secretKey } = getCashfreeCredentials();

  return {
    'x-client-id': appId,
    'x-client-secret': secretKey,
    'x-api-version': '2023-08-01',
    'Content-Type': 'application/json',
  };
}

function sanitizeEnvUrl(value = '', label = 'URL') {
  let url = value.trim();

  // Fix common copy-paste mistakes from .env or Render dashboard
  url = url.replace(/^["']|["']$/g, '');
  url = url.replace(/^(FRONTEND_URL|BACKEND_URL)\s*=\s*/i, '');
  url = url.replace(/^["']|["']$/g, '');
  url = url.replace(/\/$/, '');

  if (!/^https?:\/\/.+/i.test(url)) {
    throw new CashfreeConfigError(
      `${label} is invalid: "${value}". Set only the URL, e.g. https://unnati-charitable-api.onrender.com`
    );
  }

  return url;
}

function getCashfreePublicUrls() {
  const frontendUrl = sanitizeEnvUrl(process.env.FRONTEND_URL, 'FRONTEND_URL');
  const backendUrl = sanitizeEnvUrl(process.env.BACKEND_URL, 'BACKEND_URL');

  if (!frontendUrl || !backendUrl) {
    throw new CashfreeConfigError(
      'FRONTEND_URL and BACKEND_URL must be set in Backend/.env'
    );
  }

  if (getCashfreeEnvironment() === 'production') {
    if (!frontendUrl.startsWith('https://') || !backendUrl.startsWith('https://')) {
      throw new CashfreeConfigError(
        'Production Cashfree requires HTTPS FRONTEND_URL and BACKEND_URL. Use ngrok or deploy your app, or switch to sandbox credentials for local testing.'
      );
    }
  }

  return { frontendUrl, backendUrl };
}

function validateCashfreeConfig() {
  getCashfreeCredentials();
  getCashfreePublicUrls();
  getCashfreeBaseUrl();
  getCashfreeEnvironment();
}

function trySanitizeEnvUrl(value, label) {
  if (!value) {
    return '(not set)';
  }

  try {
    return sanitizeEnvUrl(value, label);
  } catch {
    return `(invalid: ${value})`;
  }
}

function logCashfreeConfig() {
  const environment = getCashfreeEnvironment();
  const baseUrl = getCashfreeBaseUrl();
  const { secretKey } = getCashfreeCredentials();
  const frontendUrl = process.env.FRONTEND_URL || '';
  const backendUrl = process.env.BACKEND_URL || '';

  console.log(`Cashfree ready: ${environment} -> ${baseUrl}`);
  console.log(
    `Public URLs: frontend=${trySanitizeEnvUrl(frontendUrl, 'FRONTEND_URL')} backend=${trySanitizeEnvUrl(backendUrl, 'BACKEND_URL')}`
  );

  if (
    environment === 'production' &&
    (frontendUrl.startsWith('http://') || backendUrl.startsWith('http://'))
  ) {
    console.warn(
      'Cashfree warning: production mode requires HTTPS FRONTEND_URL and BACKEND_URL.'
    );
  }
}

async function createCashfreeOrder(orderPayload) {
  validateCashfreeConfig();

  const response = await axios.post(
    `${getCashfreeBaseUrl()}/orders`,
    orderPayload,
    { headers: getCashfreeHeaders() }
  );

  return response.data;
}

async function getCashfreeOrderStatus(orderId) {
  validateCashfreeConfig();

  const response = await axios.get(
    `${getCashfreeBaseUrl()}/orders/${orderId}`,
    { headers: getCashfreeHeaders() }
  );

  return response.data;
}

module.exports = {
  CashfreeConfigError,
  createCashfreeOrder,
  getCashfreeOrderStatus,
  getCashfreeEnvironment,
  getCashfreePublicUrls,
  logCashfreeConfig,
  validateCashfreeConfig,
};
