import { useEffect, useState } from 'react';
import { validateImage } from '../lib/storage';

/**
 * Зураг сонгох, урьдчилан харах. Файлыг шууд оруулахгүй — эцэг компонент
 * хадгалах үед uploadImage()-ээр Storage руу илгээнэ.
 */
export default function ImageUpload({ label = 'Зураг', currentUrl, onFileChange, onRemove }) {
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError] = useState('');

  useEffect(() => setPreview(currentUrl || ''), [currentUrl]);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err) {
      setError(err);
      e.target.value = '';
      return;
    }
    setError('');
    setPreview(URL.createObjectURL(file));
    onFileChange(file);
  }

  function handleRemove() {
    setPreview('');
    onFileChange(null);
    onRemove?.();
  }

  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="upload">
        {preview ? (
          <img src={preview} alt="Урьдчилан харах" className="upload__preview" />
        ) : (
          <div className="upload__placeholder">Зураг сонгоогүй</div>
        )}
        <div className="upload__actions">
          <label className="btn btn--ghost btn--sm">
            Зураг сонгох
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleChange} hidden />
          </label>
          {preview && (
            <button type="button" className="btn btn--text btn--sm" onClick={handleRemove}>
              Арилгах
            </button>
          )}
          <small className="muted">JPG, PNG, WEBP · 5 MB хүртэл</small>
        </div>
      </div>
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
