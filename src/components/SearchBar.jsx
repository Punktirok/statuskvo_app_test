import { getInterfaceIcon } from '../utils/iconLoader.js'

const searchIcon = getInterfaceIcon('iconSearch')

function SearchBar({
  value,
  onChange,
  placeholder = 'Поиск',
  className = '',
  inputProps = {},
}) {
  return (
    <label
      className={`flex items-center gap-3 rounded-full bg-surface-card px-4 py-3 text-sm shadow-card ${className}`}
    >
      {searchIcon && (
        <img
          src={searchIcon}
          alt=""
          className="size-5 shrink-0"
          aria-hidden="true"
        />
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full border-none bg-transparent text-base font-medium text-text-primary outline-none placeholder:text-text-secondary"
        {...inputProps}
      />
    </label>
  )
}

export default SearchBar
