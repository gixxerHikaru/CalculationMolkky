import { useState } from 'react';

type Team = 'A' | 'B';
type TeamMessage = '🟥チームAの番です' | '🟦チームBの番です';
type State = {
  scoreA: number;
  foulA: number;
  scoreB: number;
  foulB: number;
  turn: 'A' | 'B';
};

const initialState: State = { scoreA: 0, foulA: 0, scoreB: 0, foulB: 0, turn: 'A' };

export default function CalculationMolkky() {
  const [winner, setWinner] = useState<Team | null>(null);
  const [loser, setLoser] = useState<Team | null>(null);
  const [history, setHistory] = useState<State[]>([initialState]);
  const current = history[history.length - 1];
  const handleScore = (point: number) => {
    setHistory(prev => [
      ...prev,
      current.turn === 'A'
        ? {
            scoreA: current.scoreA + point > 50 ? 25 : current.scoreA + point,
            foulA: point == 0 ? current.foulA + 1 : 0,
            scoreB: current.scoreB,
            foulB: current.foulB,
            turn: 'B',
          }
        : {
            scoreA: current.scoreA,
            foulA: current.foulA,
            scoreB: current.scoreB + point > 50 ? 25 : current.scoreB + point,
            foulB: point == 0 ? current.foulB + 1 : 0,
            turn: 'A',
          },
    ]);
    if (current.turn === 'A') {
      if (current.scoreA + point == 50) {
        setWinner('A');
      } else if (current.foulA == 2 && point == 0) {
        setLoser('A');
      }
    } else if (current.turn === 'B') {
      if (current.scoreB + point == 50) {
        setWinner('B');
      } else if (current.foulB == 2 && point == 0) {
        setLoser('B');
      }
    }
  };
  const handleBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  let teamMessage: TeamMessage = getTeamMessage();

  return (
    <main className="min-h-screen flex flex-col items-center pt-8 pb-4 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md flex flex-col items-center gap-4 text-gray-800 dark:text-gray-100">
        <header className="w-full flex flex-col items-center py-2 bg-white dark:bg-gray-800 rounded-l shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-xl font-bold">モルック・スコア計算(2チーム)</h1>
        </header>

        <div className="w-full flex items-stretch bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          {displayTeamScore('A')}
          <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-2 text-[10px] font-bold text-gray-400 border-x border-gray-100 dark:border-gray-700">
            VS
          </div>
          {displayTeamScore('B')}
        </div>

        <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-l shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-full p-2 bg-white dark:bg-gray-800 rounded-l">
            <p className="text-sm">{teamMessage}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
              <button
                key={i + 1}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
                onClick={() => {
                  handleScore(i + 1);
                }}
              >
                {i + 1}点
              </button>
            ))}
            <div />
            <button
              className="flex items-center justify-center h-16 text-lg font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl active:scale-95 transition-all border border-red-100 dark:border-red-800"
              onClick={() => handleScore(0)}
            >
              ファウル
            </button>
            <button
              className="flex items-center justify-center h-16 text-lg font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl active:scale-95 transition-all border border-amber-100 dark:border-amber-800"
              onClick={() => handleBack()}
            >
              戻る
            </button>
          </div>
        </div>
      </div>
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center space-y-4">
            <h2 className="text-2xl font-bold">
              {winner === 'A' ? '🟥 チームA' : '🟦 チームB'} の勝利！
            </h2>
            {againButton()}
          </div>
        </div>
      )}
      {loser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center space-y-4">
            <h2 className="text-2xl font-bold">
              {loser === 'A' ? '🟥 チームA' : '🟦 チームB'} の敗北…
            </h2>
            {againButton()}
          </div>
        </div>
      )}
    </main>
  );

  function againButton() {
    return (
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300"
        onClick={() => {
          setWinner(null);
          setLoser(null);
          setHistory([initialState]);
        }}
      >
        もう一度
      </button>
    );
  }

  function displayTeamScore(team: Team) {
    const foulCount = team === 'A' ? current.foulA : current.foulB;
    return (
      <div
        id={team == 'A' ? 'team-a-box' : 'team-b-box'}
        data-testid={team == 'A' ? 'team-a-box' : 'team-b-box'}
        className={`flex-1 p-4 transition-all ${current.turn === team ? ' bg-yellow-100 dark:bg-yellow-900/20 ring-2 ring-inset ring-yellow-500' : ''}`}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            TEAM {team == 'A' ? 'A🟥' : 'B🟦'}
          </span>
          <div className="flex items-center gap-2">
            {team == 'A' ? `${current.scoreA}点` : `${current.scoreB}点`}
          </div>
          {foulCount > 0 && (
            <div className="mt-1 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">
                ファウル：{foulCount}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function getTeamMessage() {
    let teamMessage: TeamMessage = '🟥チームAの番です';
    switch (current.turn) {
      case 'A':
        teamMessage = '🟥チームAの番です';
        break;
      case 'B':
        teamMessage = '🟦チームBの番です';
        break;
    }
    return teamMessage;
  }
}
