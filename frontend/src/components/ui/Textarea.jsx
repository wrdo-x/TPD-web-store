export default function Textarea({
  label,
  variant = "default",
  className = "",
  ...props
}) {
  const baseStyle =
    "w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none";

  const variants = {
    default: "px-3 py-2 text-sm",
    large: "px-4 py-4 text-base min-h-[200px]",
    small: "px-2 py-1 text-xs h-20",
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea className={`${baseStyle} ${variants[variant]}`} {...props} />
    </div>
  );
}
