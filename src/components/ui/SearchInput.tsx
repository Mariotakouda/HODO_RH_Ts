interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Rechercher..." }: SearchInputProps) {
  return (
    <div className="position-relative mb-4">
      <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
        <i className="bi bi-search" />
      </span>
      <input
        type="text"
        className="form-control form-control-lg ps-5 rounded-4 border-0 shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: 16, height: 55 }}
      />
    </div>
  );
}
