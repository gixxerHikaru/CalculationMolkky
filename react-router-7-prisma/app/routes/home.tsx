import { useState } from 'react';
import type { Route } from './+types/home';
import CalculationMolkky from './CalculationMolkky';
import CalculationMolkkyThreeTeam from './CalculationMolkkyThreeTeam';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

type View = 'MENU' | 'GAME_2' | 'GAME_3';

export default function Home() {
  const [view, setView] = useState<View>('MENU');

  if (view === 'GAME_2') {
    return <CalculationMolkky />;
  }

  if (view === 'GAME_3') {
    return <CalculationMolkkyThreeTeam />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center pt-8 pb-4 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md flex flex-col items-center gap-4 text-gray-800 dark:text-gray-100">
        <header className="w-full flex flex-col items-center py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-xl font-bold">モルック・スコア計算</h1>
        </header>
        <div className="w-full flex flex-col items-center gap-4 text-gray-800 dark:text-gray-100">
          <button
            onClick={() => {
              setView('GAME_2');
            }}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold shadow transition-all active:scale-95"
          >
            2チームで遊ぶ
          </button>

          <button
            onClick={() => {
              setView('GAME_3');
            }}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold shadow transition-all active:scale-95"
          >
            3チームで遊ぶ
          </button>
        </div>
      </div>
    </main>
  );
}
