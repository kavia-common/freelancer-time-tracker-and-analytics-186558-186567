import React, { useMemo } from 'react';

export function TextInput({ label, value, onChange, placeholder, type = 'text', required, min }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="muted">{label}</span>
      <input className="input" value={value ?? ''} onChange={e => onChange(e.target.value)}
             placeholder={placeholder} type={type} required={required} min={min} />
    </label>
  );
}

export function Select({ label, value, onChange, options = [], required }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="muted">{label}</span>
      <select className="select" value={value ?? ''} onChange={e => onChange(e.target.value)} required={required}>
        <option value="" disabled>Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function CurrencyInput({ label, value, onChange }) {
  const step = useMemo(() => '0.01', []);
  return (
    <TextInput label={label} type="number" min="0" value={value} onChange={onChange} placeholder="0.00" />
  );
}
