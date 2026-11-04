export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyle =
    "inline-flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const variants = {
    primary:
      "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    danger:
      "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    outline:
      "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
