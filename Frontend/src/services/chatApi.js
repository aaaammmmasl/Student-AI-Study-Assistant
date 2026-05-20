import api from "./api";

export const sendChatRequest = async ({ message, sessionId, files }) => {
  const formData = new FormData();

  formData.append("message", message);
  formData.append("sessionId", sessionId);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await api.post("/api/chat", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
