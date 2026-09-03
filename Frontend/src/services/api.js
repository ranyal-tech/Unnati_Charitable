const configuredApiUrl = import.meta.env.VITE_API_URL;
const usesLocalhostInProd = import.meta.env.PROD && configuredApiUrl?.includes('localhost');

if (usesLocalhostInProd) {
  console.warn(
    `VITE_API_URL was built with a localhost value ("${configuredApiUrl}") in a production build. Falling back to "/api".`
  );
}

const API_URL = usesLocalhostInProd ? '/api' : configuredApiUrl || '/api';

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error(
      'Cannot reach the backend API. Make sure the backend is running on port 5000.'
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const getCategories = () => request('/categories');

export const getCategoryBySlug = (slug) => request(`/categories/${slug}`);

export const createDonationOrder = (payload) =>
  request('/donations/create-order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getDonationStatus = (id) => request(`/donations/${id}/status`);

export const verifyDonation = (id, options = {}) =>
  request(`/donations/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
