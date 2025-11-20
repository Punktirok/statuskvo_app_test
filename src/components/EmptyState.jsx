function EmptyState({
  title,
  description,
  imageSrc,
  className = '',
  children,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[20px] bg-surface-card px-6 py-8 text-center shadow-card ${className}`}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          className="mb-5 h-32 w-32"
          aria-hidden="true"
        />
      )}
      {title && (
        <p className="mb-3 text-xl font-semibold text-text-primary">{title}</p>
      )}
      {description && (
        <p className="max-w-[260px] text-base font-medium text-text-primary/80">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}

export default EmptyState
