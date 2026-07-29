import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Card.module.scss";

interface CardProps {
  title: string;
  text?: string;
  to?: string;
  className?: string;
  children?: ReactNode;
}

export function Card({
  title,
  text,
  to,
  className,
  children,
}: Readonly<CardProps>) {
  const body = (
    <>
      <span className={styles.cardTitle}>{title}</span>
      {text ? <span className={styles.cardText}>{text}</span> : null}
      {children}
    </>
  );

  if (to) {
    const classNames = [styles.card, styles.link, className]
      .filter(Boolean)
      .join(" ");

    return (
      <Link to={to} className={classNames}>
        {body}
      </Link>
    );
  }

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      {body}
    </div>
  );
}
