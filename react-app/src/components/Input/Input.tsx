import type { InputHTMLAttributes, Ref } from "react";
import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hideLabel?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  error,
  hideLabel = false,
  id,
  ref,
  className,
  ...rest
}: Readonly<InputProps>) {
  const inputId = id ?? rest.name ?? label;
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.field}>
      <label
        className={hideLabel ? styles.labelHidden : styles.label}
        htmlFor={inputId}
      >
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        ref={ref}
        className={[styles.input, error ? styles.invalid : null, className]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <span className={styles.error} id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
