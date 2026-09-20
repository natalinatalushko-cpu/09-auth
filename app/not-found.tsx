import type { Metadata } from 'next';
import css from './Home.module.css';

export const metadata: Metadata = {
  title: '404 - Page not found | NoteHub',
  description: 'The page you are looking for does not exist.',
  openGraph: {
    title: '404 - Page not found | NoteHub',
    description: 'The page you are looking for does not exist.',
    url: 'https://notehub.com/not-found',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'NoteHub — page not found',
      },
    ],
  },
};

export default function NotFound() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>404 - Page not found</h1>
        <p className={css.description}>
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </main>
  );
}
