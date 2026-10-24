import axios from "axios";
import { API_URL } from "../config";

const AUTH_KEY = "mynewhome.auth";

export function loadAuth() {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (!auth?.token || isExpired(auth.token)) return null;
    return auth;
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  else localStorage.removeItem(AUTH_KEY);
}

function isExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

const api = axios.create({ baseURL: API_URL, timeout: 60000 });

api.interceptors.request.use((config) => {
  const auth = loadAuth();
  if (auth) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});

// Called when the server rejects our token, so the UI can log the user out
let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error?.response) return "Can't reach the server. Check your connection and try again.";
  return error.response.data?.error || error.response.data?.message || fallback;
}

export function imageSrc(property) {
  if (!property?.imageUrl) return null;
  // Version query busts the browser cache after the owner replaces the photo
  const v = property.updatedAt || "";
  return `${API_URL}${property.imageUrl}${v ? `?v=${encodeURIComponent(v)}` : ""}`;
}

function toFormData(values, image) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ""));
  if (image) fd.append("image", image);
  return fd;
}

export const authApi = {
  login: (username, password) => api.post("/api/auth/login", { username, password }).then((r) => r.data),
  register: (data) => api.post("/api/auth/register", data).then((r) => r.data),
  google: (credential) => api.post("/api/auth/google-login", { credential }).then((r) => r.data),
};

export const propertyApi = {
  list: (params) => api.get("/api/properties", { params }).then((r) => r.data),
  mine: () => api.get("/api/properties/mine").then((r) => r.data),
  get: (id) => api.get(`/api/properties/${id}`).then((r) => r.data),
  create: (values, image) => api.post("/api/properties", toFormData(values, image)).then((r) => r.data),
  update: (id, values, image) => api.put(`/api/properties/${id}`, toFormData(values, image)).then((r) => r.data),
  remove: (id) => api.delete(`/api/properties/${id}`).then((r) => r.data),
  generateDescription: (values) =>
    api
      .post("/api/gemini/description", {
        title: values.title,
        category: values.category,
        city: values.city,
        location: values.location,
      })
      .then((r) => r.data.description),
};

export default api;
