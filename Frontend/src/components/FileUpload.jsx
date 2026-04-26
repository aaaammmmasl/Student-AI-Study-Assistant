function FileUpload({ setFile }) {
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return <input type="file" onChange={handleFileChange} />;
}

export default FileUpload;
