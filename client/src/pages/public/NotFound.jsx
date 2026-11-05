import { Link } from 'react-router-dom';
import { useTitle } from '../../lib/hooks.js';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <section className="container-x py-24 text-center">
      <p className="font-serif text-6xl text-gold">404</p>
      <h1 className="mt-4 text-3xl">Page not found</h1>
      <p className="mt-2 text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-dark mt-8">Back to home</Link>
    </section>
  );
}
