const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

export const getRecipes = (search = "", page = 1) =>
  request(`/recipes?search=${encodeURIComponent(search)}&page=${page}&limit=6`);
export const getRecipe = (id) => request(`/recipes/${id}`);
export const createRecipe = (form) =>
  request("/recipes", { method: "POST", body: form });
export const updateRecipe = (id, form) =>
  request(`/recipes/${id}`, { method: "PUT", body: form });
export const toggleLike = (id, user) =>
  request(`/recipes/${id}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user }),
  });
export const toggleSave = (id, user) =>
  request(`/recipes/${id}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user }),
  });
