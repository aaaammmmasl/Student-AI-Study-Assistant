import { UploadCloud, FileText, X } from "lucide-react";

function FileUpload({ file, setFile }) {
  const inputId = "pdf-upload-input";

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        id={inputId}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
      >
        <UploadCloud size={16} />
        Upload PDF
      </label>

      {file && (
        <div className="flex items-center gap-2 rounded-2xl border border-lime-400/20 bg-lime-400/10 px-3 py-2 text-xs text-lime-300">
          <FileText size={14} />
          <span className="max-w-40 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="ml-1 rounded-full p-1 text-lime-300 transition hover:bg-lime-400/10"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;