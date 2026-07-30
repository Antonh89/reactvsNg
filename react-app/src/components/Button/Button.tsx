import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  active?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  active = false,
  type = "button",
  className,
  children,
  ...rest
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        styles[variant],
        active && styles.active,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
