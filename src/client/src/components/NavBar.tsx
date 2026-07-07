import { Link } from 'react-router-dom';

export const NavBar = () => {
  return (
    <nav
      style={{
        padding: '15px 0',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px',
      }}
    >
      <Link
        to="/"
        style={{
          color: '#007bff',
          textDecoration: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        Головна
      </Link>
    </nav>
  );
};
