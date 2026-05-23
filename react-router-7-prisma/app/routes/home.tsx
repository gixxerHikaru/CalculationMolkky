import { useState } from 'react';
import type { Route } from './+types/home';
import MemberSetup from './setup';
import CalculationMolkky from './CalculationMolkky';
import CalculationMolkkyThreeTeam from './CalculationMolkkyThreeTeam';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

type View = 'MENU' | 'SETUP' | 'GAME_2' | 'GAME_3';

export default function Home() {
  const [view, setView] = useState<View>('MENU');
  const [members, setMembers] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<{
    membersA: string;
    membersB: string;
    membersC?: string;
  }>({ membersA: '', membersB: '' });

  const startTwoTeamGame = (a: string, b: string) => {
    setTeamMembers({ membersA: a, membersB: b });
    setView('GAME_2');
  };

  const startThreeTeamGame = (a: string, b: string, c: string) => {
    setTeamMembers({ membersA: a, membersB: b, membersC: c });
    setView('GAME_3');
  };

  if (view === 'SETUP') {
    return (
      <MemberSetup
        members={members}
        setMembers={setMembers}
        onStartTwoTeam={startTwoTeamGame}
        onStartThreeTeam={startThreeTeamGame}
        onBack={() => setView('MENU')}
      />
    );
  }

  if (view === 'GAME_2') {
    return (
      <CalculationMolkky
        membersA={teamMembers.membersA}
        membersB={teamMembers.membersB}
        onBack={() => setView(teamMembers.membersA ? 'SETUP' : 'MENU')}
      />
    );
  }

  if (view === 'GAME_3') {
    return (
      <CalculationMolkkyThreeTeam
        membersA={teamMembers.membersA}
        membersB={teamMembers.membersB}
        membersC={teamMembers.membersC || ''}
        onBack={() => setView(teamMembers.membersA ? 'SETUP' : 'MENU')}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center pt-8 pb-4 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md flex flex-col items-center gap-4 text-gray-800 dark:text-gray-100">
        <header className="w-full flex flex-col items-center py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-xl font-bold">モルック・スコア計算</h1>
        </header>
        <div className="w-full flex flex-col items-center gap-4 text-gray-800 dark:text-gray-100">
          {
            <button
              onClick={() => setView('SETUP')}
              className="w-full px-4 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg transition-all active:scale-95"
            >
              👥 メンバーを登録して遊ぶ
            </button>
          }

          {
            <div className="w-full flex items-center gap-2 py-4">
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-xs text-gray-400 font-bold uppercase">クイック開始</span>
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700"></div>
            </div>
          }

          <button
            onClick={() => {
              setTeamMembers({ membersA: '', membersB: '' });
              setView('GAME_2');
            }}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold shadow transition-all active:scale-95"
          >
            2チームで遊ぶ
          </button>

          <button
            onClick={() => {
              setTeamMembers({ membersA: '', membersB: '', membersC: '' });
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
