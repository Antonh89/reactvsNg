import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./Checkbox.module.scss";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  struck?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({
  label,
  struck = false,
  id,
  ref,
  className,
  ...rest
}: Readonly<CheckboxProps>) {
  const inputId = id ?? rest.name;

  return (
    <label className={clsx(styles.wrapper, className)} htmlFor={inputId}>
      <input {...rest} id={inputId} ref={ref} type="checkbox" className={styles.input} />
      <span className={styles.box} aria-hidden="true" />
      <span className={clsx(styles.text, struck && styles.textStruck)}>{label}</span>
    </label>
  );
}
