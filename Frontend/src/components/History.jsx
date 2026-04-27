function History({ history, setResult }) {
  if (!history.length) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>History</h3>

      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => setResult(item.result)}
          style={{
            padding: "12px",
            marginBottom: "10px",
            background: "#f1f1f1",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <strong>{item.type.toUpperCase()}</strong>
          <p style={{ margin: "5px 0", fontSize: "13px" }}>
            {item.prompt || "No prompt"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default History;
