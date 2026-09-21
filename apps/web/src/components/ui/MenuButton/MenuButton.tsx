import styles from "./MenuButton.module.css";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  controls: string;
}

export function MenuButton({ isOpen, onClick, controls }: MenuButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${isOpen ? styles.open : ""}`}
      onClick={onClick}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
      aria-controls={controls}
    >
      <span className={styles.bar} />
      <span className={styles.bar} />
    </button>
  );
}
