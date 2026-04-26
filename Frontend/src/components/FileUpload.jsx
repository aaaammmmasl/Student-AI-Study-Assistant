function FileUpload({ setFile }) {
  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
    </div>
  );
}

export default FileUpload;
