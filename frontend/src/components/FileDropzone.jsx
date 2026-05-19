import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image } from 'lucide-react';

export default function FileDropzone({ label, accept, maxSize = 10, onFile, preview, error, hint }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(preview || null);

  const onDrop = useCallback((accepted) => {
    if (!accepted.length) return;
    const f = accepted[0];
    setFile(f);
    onFile?.(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024,
    multiple: false,
  });

  const clear = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    onFile?.(null);
  };

  const isPdf = file?.type === 'application/pdf';

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${error ? 'var(--red)' : isDragActive ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'rgba(61,126,255,0.06)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={previewUrl} alt="preview" style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} />
            <button onClick={clear} style={{
              position: 'absolute', top: -8, right: -8,
              background: 'var(--red)', border: 'none', borderRadius: '50%',
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}><X size={12} /></button>
          </div>
        ) : file && isPdf ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <FileText size={32} color="var(--blue)" />
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>{file.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={clear} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 8, color: 'var(--text-muted)' }}>
              <Upload size={28} strokeWidth={1.5} />
            </div>
            <p style={{ color: isDragActive ? 'var(--blue)' : 'var(--text-secondary)', fontSize: 14 }}>
              {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
            </p>
            {hint && <p className="form-hint" style={{ marginTop: 4 }}>{hint}</p>}
          </div>
        )}
      </div>
      {error && <p className="form-error">⚠ {error}</p>}
    </div>
  );
}