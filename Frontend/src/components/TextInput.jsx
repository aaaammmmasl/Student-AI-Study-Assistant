function TextInput({ text, setText, file }) {
  return (
    <div style={{ position: "relative" }}>
      <textarea
        placeholder="اكتب النص هنا أو اتركه فارغًا إذا كان لديك ملف PDF فقط..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          resize: "vertical",
        }}
      />

      {file && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "#f1f1f1",
            borderRadius: "999px",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <span>📎</span>
          <span>{file.name}</span>
        </div>
      )}
    </div>
  );
}

export default TextInput;
