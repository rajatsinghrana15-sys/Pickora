const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function api(path, options = {}) {
  const token = localStorage.getItem("pickora-token");
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(
        data.message || "Something went wrong. Please try again.",
      );
    return data;
  });
}

export const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
