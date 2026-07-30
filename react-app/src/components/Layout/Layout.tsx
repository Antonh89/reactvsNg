import clsx from "clsx";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.scss";

const links = [
  { to: "/", label: "Accueil", end: true },
  { to: "/counter", label: "Compteur", end: false },
  { to: "/todos", label: "TodoList", end: false },
];

export function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <span className={styles.brand}>React 19</span>
          <nav className={styles.nav}>
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(styles.link, isActive && styles.linkActive)
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
