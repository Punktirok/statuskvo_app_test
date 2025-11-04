import { getInterfaceIcon } from '../utils/iconLoader.js'

const searchIcon = getInterfaceIcon('iconSearch')
const closeIcon = getInterfaceIcon('iconClose')

function SearchBar({
  value,
  onChange,
  placeholder = 'Поиск',
  className = '',
  inputProps = {},
}) {
  const showClear = Boolean(value)

  return (
    <label
      className={`flex items-center gap-2 rounded-full bg-surface-card px-4 py-3 text-sm shadow-card ${className}`}
    >
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full border-none bg-transparent text-base font-medium text-text-primary outline-none placeholder:text-text-secondary"
        {...inputProps}
      />

      {showClear && closeIcon ? (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => onChange?.('')}
          className="flex items-center justify-center text-text-secondary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <img
            src={closeIcon}
            alt=""
            className="size-5 shrink-0"
            aria-hidden="true"
          />
        </button>
      ) : (
        searchIcon && (
          <img
            src={searchIcon}
            alt=""
            className="size-5 shrink-0"
            aria-hidden="true"
          />
        )
      )}
    </label>
  )
}

export default SearchBar
