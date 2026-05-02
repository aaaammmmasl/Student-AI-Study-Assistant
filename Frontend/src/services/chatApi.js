export async function sendChatRequest({ message, messages, files }) {
  const hasFiles = files && files.length > 0;

  if (hasFiles) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("message", message);
    formData.append("messages", JSON.stringify(messages));

    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      body: formData,
    });

    return res.json();
  }

  const res = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, messages }),
  });

  return res.json();
}
