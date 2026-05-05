import { Link } from 'react-router';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center pt-8 pb-4 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md flex flex-col items-center gap-4 text-gray-800 dark:text-gray-100">
          <header className="w-full flex flex-col items-center py-2 bg-white dark:bg-gray-800 rounded-l shadow-sm border border-gray-100 dark:border-gray-700">
            <h1 className="text-xl font-bold">モルック・スコア計算</h1>
          </header>

          <Link to="two_team">2チームで遊ぶ</Link>
        </div>
      </main>
    </>
  );
}
