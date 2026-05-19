import { useState } from 'react';
import FileDropzone from '../../../components/FileDropzone';
import MapPicker from '../../../components/MapPicker';
import MultiSelectChips from '../../../components/MultiSelectChips';

export default function BusinessDetails({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    tradeLicenseNo: data.tradeLicenseNo || '',
    tradeLicenseExpiry: data.tradeLicenseExpiry || '',
    storeAddress: data.storeAddress || '',
    city: data.city || '',
    yearsInBusiness: data.yearsInBusiness || '',
    vatNumber: data.vatNumber || '',
    businessCategories: data.businessCategories || [],
    mapCoordinates: data.mapCoordinates || null,
    tradeLicenseFile: data.tradeLicenseFile || null,
    idPassportFile: data.idPassportFile || null,
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.tradeLicenseNo) e.tradeLicenseNo = 'Required';
    if (!form.tradeLicenseExpiry) e.tradeLicenseExpiry = 'Required';
    else if (form.tradeLicenseExpiry < today) e.tradeLicenseExpiry = 'Expiry date cannot be in the past';
    if (!form.tradeLicenseFile) e.tradeLicenseFile = 'Upload required';
    if (!form.idPassportFile) e.idPassportFile = 'Upload required';
    if (!form.storeAddress) e.storeAddress = 'Required';
    if (!form.city) e.city = 'Required';
    if (!form.businessCategories.length) e.businessCategories = 'Select at least one category';
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(form);
  };

  return (
    <div>
      <div className="form-grid-2" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="tradeLicenseNo">Trade License No. <span>*</span></label>
          <input id="tradeLicenseNo" className={`form-input${errors.tradeLicenseNo ? ' error' : ''}`}
            placeholder="TL-2024-XXXXX" value={form.tradeLicenseNo}
            onChange={(e) => set('tradeLicenseNo', e.target.value)} />
          {errors.tradeLicenseNo && <p className="form-error">⚠ {errors.tradeLicenseNo}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="tradeLicenseExpiry">License Expiry Date <span>*</span></label>
          <input id="tradeLicenseExpiry" type="date" className={`form-input${errors.tradeLicenseExpiry ? ' error' : ''}`}
            min={today} value={form.tradeLicenseExpiry}
            onChange={(e) => set('tradeLicenseExpiry', e.target.value)} />
          {errors.tradeLicenseExpiry && <p className="form-error">⚠ {errors.tradeLicenseExpiry}</p>}
        </div>
      </div>

      <div className="form-grid-2" style={{ marginBottom: 20 }}>
        <FileDropzone label="Trade License Document *"
          accept={{ 'image/*': [], 'application/pdf': ['.pdf'] }}
          onFile={(f) => set('tradeLicenseFile', f)} error={errors.tradeLicenseFile}
          hint="PDF or image, max 10MB" />
        <FileDropzone label="ID / Passport Document *"
          accept={{ 'image/*': [], 'application/pdf': ['.pdf'] }}
          onFile={(f) => set('idPassportFile', f)} error={errors.idPassportFile}
          hint="PDF or image, max 10MB" />
      </div>

      <div className="form-grid-2" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="storeAddress">Store Address <span>*</span></label>
          <input id="storeAddress" className={`form-input${errors.storeAddress ? ' error' : ''}`}
            placeholder="123 Tech Street, Dubai" value={form.storeAddress}
            onChange={(e) => set('storeAddress', e.target.value)} />
          {errors.storeAddress && <p className="form-error">⚠ {errors.storeAddress}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="city">City <span>*</span></label>
          <input id="city" className={`form-input${errors.city ? ' error' : ''}`}
            placeholder="Dubai" value={form.city}
            onChange={(e) => set('city', e.target.value)} />
          {errors.city && <p className="form-error">⚠ {errors.city}</p>}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <MapPicker value={form.mapCoordinates} onChange={(coords) => set('mapCoordinates', coords)} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <MultiSelectChips value={form.businessCategories}
          onChange={(cats) => set('businessCategories', cats)} error={errors.businessCategories} />
      </div>

      <div className="form-grid-2" style={{ marginBottom: 28 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="yearsInBusiness">Years in Business</label>
          <input id="yearsInBusiness" type="number" min="0" max="100" className="form-input"
            placeholder="5" value={form.yearsInBusiness}
            onChange={(e) => set('yearsInBusiness', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="vatNumber">VAT Registration No.</label>
          <input id="vatNumber" className="form-input"
            placeholder="Optional" value={form.vatNumber}
            onChange={(e) => set('vatNumber', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" className="btn btn-ghost" onClick={onBack} style={{ flex: 1 }}>← Back</button>
        <button type="button" className="btn btn-primary" onClick={submit} style={{ flex: 1 }}>Continue →</button>
      </div>
    </div>
  );
}