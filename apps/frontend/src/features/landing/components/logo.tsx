import { Link } from 'react-router-dom';
import styles from './nav.module.css';

interface LogoProps {
  'to'?: string;
  'className'?: string;
  'aria-label'?: string;
}

export function Logo({
  to = '/',
  className,
  'aria-label': ariaLabel = 'PlayGrid home',
}: LogoProps) {
  return (
    <Link to={to} className={`${styles.logo} ${className || ''}`} aria-label={ariaLabel}>
      Play
      <em>Grid</em>
    </Link>
  );
};
