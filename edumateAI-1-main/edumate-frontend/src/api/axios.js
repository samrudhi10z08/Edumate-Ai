import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Marks API endpoints
export const saveMarks = (marksData) => {
  return api.post("/performance/marks", { marks: marksData });
};

export const getMarks = () => {
  return api.get("/performance/marks");
};

export const getPerformanceAnalytics = () => {
  return api.get("/performance/analytics");
};

export const predictPerformance = (grades) => {
  return api.post("/performance/predict", { grades });
};

// OCR API endpoints
export const extractMarksOCR = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/ocr/extract-text", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getExpectedSubjects = () => {
  return api.get("/ocr/expected-subjects");
};

export const checkOCRStatus = () => {
  return api.get("/ocr/status");
};

// Notification API endpoints
export const getNotifications = () => {
  return api.get("/notification/get-notifications");
};

export const markNotificationAsRead = (notifId) => {
  return api.put(`/notification/mark-as-read/${notifId}`);
};

export const deleteNotification = (notifId) => {
  return api.delete(`/notification/delete/${notifId}`);
};

export const sendTestNotification = (data) => {
  return api.post("/notification/send-test", data);
};

export default api;