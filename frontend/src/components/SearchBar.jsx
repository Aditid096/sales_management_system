export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="border rounded px-3 py-2 w-64"
      placeholder="Name, Phone no."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
