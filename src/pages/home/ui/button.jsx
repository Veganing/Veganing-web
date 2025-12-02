import clsx from "clsx";

export function Button({ variant = "default", size = "md", className, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300";

  const variants = {
    default: "bg-teal-500 text-white hover:bg-teal-600 shadow-md",
    outline:
      "border-2 border-teal-400 text-teal-600 hover:bg-teal-50",
    ghost: "text-teal-600 hover:bg-teal-50",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-base",
    lg: "h-14 px-7 text-lg",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
