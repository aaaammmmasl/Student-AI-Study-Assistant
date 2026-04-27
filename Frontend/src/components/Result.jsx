function Result({ result }) {
  if (!result) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>{result}</div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "20px",
  },
  card: {
    maxWidth: "850px",
    width: "100%",
    padding: "20px",
    background: "",
    borderRadius: "12px",
    textAlign: "left",
    whiteSpace: "pre-wrap",
    lineHeight: "1.7",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    fontSize: "15px",
  },
};

export default Result;
