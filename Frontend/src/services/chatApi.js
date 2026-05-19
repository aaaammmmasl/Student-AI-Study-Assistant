const API_URL = import.meta.env.VITE_API_URL;

export const sendChatRequest = async ({ message, sessionId, files }) => {
  const formData = new FormData();

  formData.append("message", message);
  formData.append("sessionId", sessionId);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.json();
};
