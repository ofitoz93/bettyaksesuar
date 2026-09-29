import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "dark" | "light" | "white" | "ghost-light";

const variantClasses: Record<Variant, string> = {
  dark: "bg-ink text-ivory border-ink hover:bg-gold-deep hover:border-gold-deep",
  light:
    "bg-transparent text-ink border-ink hover:bg-ink hover:text-ivory",
  white:
    "bg-white text-ink border-white hover:bg-gold hover:border-gold hover:text-white",
  "ghost-light":
    "bg-transparent text-ivory border-ivory hover:bg-ivory hover:text-ink",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 border px-8 py-4 font-sans text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-200 whitespace-nowrap";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  href?: string;
}

export default function Button({
  children,
  variant = "dark",
  href,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
