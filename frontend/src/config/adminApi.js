const API = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("adminToken"); // or "token" depending on your auth setup
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function fetchAlerts() {
  const res = await fetch(`${API}/admin/alerts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load alerts");
  return res.json();
}

export async function createAlert(alert) {
  const res = await fetch(`${API}/admin/alerts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(alert),
  });
  if (!res.ok) throw new Error("Failed to create alert");
  return res.json();
}

export async function updateAlert(id, data) {
  const res = await fetch(`${API}/admin/alerts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update alert");
  return res.json();
}

export async function deleteAlert(id) {
  const res = await fetch(`${API}/admin/alerts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete alert");
  return res.json();
}

// export const fetchAlerts = () => API.get('/alerts');
// export const createAlert = (data) => API.post('/alerts', data);
// export const updateAlert = (id, data) => API.put(`/alerts/${id}`, data);
// export const deleteAlert = (id) => API.delete(`/alerts/${id}`);


// const API = import.meta.env.VITE_API_URL;

// export async function scanNepal(token) {
//   const res = await fetch(`${API}/admin/scan-nepal`, {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });
//   if (!res.ok) throw new Error("Scan failed");
//   return res.json();
// }

// export const fetchAlerts = () => API.get('/alerts');
// export const createAlert = (data) => API.post('/alerts', data);
// export const updateAlert = (id, data) => API.put(`/alerts/${id}`, data);
// export const deleteAlert = (id) => API.delete(`/alerts/${id}`);
