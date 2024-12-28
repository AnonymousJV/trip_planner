const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const makeRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const uploadFile = async (endpoint, formData, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: formData,
      ...options,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};
