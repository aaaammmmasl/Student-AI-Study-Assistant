function TextInput({ text, setText }) {
  return (
    <textarea
      placeholder="write the text herehghgh..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      rows={6}
      style={{ width: "100%" }}
    />
  );
}

export default TextInput;
