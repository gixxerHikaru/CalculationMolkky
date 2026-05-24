import { useState, useEffect, useRef } from 'react';

type Team = 'A' | 'B';
type TeamMessage = '🟥チームAの番です' | '🟦チームBの番です';
type State = {
  scoreA: number;
  foulA: number;
  pointsA: (number | 'ファウル')[];
  scoreB: number;
  pointsB: (number | 'ファウル')[];
  foulB: number;
  turn: 'A' | 'B';
};
interface GameResultModalProps {
  team: Team;
  type: 'win' | 'lose';
  onReset: () => void;
}

const initialState: State = {
  scoreA: 0,
  foulA: 0,
  pointsA: [],
  scoreB: 0,
  pointsB: [],
  foulB: 0,
  turn: 'A',
};

interface CalculationMolkkyProps {
  membersA: string | null;
  membersB: string | null;
  onBack: () => void;
}

export default function CalculationMolkky({ membersA, membersB, onBack }: CalculationMolkkyProps) {
  const [winner, setWinner] = useState<Team | null>(null);
  const [loser, setLoser] = useState<Team | null>(null);
  const [history, setHistory] = useState<State[]>([initialState]);
  const current = history[history.length - 1];

  const scrollRefA = useRef<HTMLDivElement>(null);
  const scrollRefB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRefA.current) {
      scrollRefA.current.scrollTop = scrollRefA.current.scrollHeight;
    }
  }, [current.pointsA]);

  useEffect(() => {
    if (scrollRefB.current) {
      scrollRefB.current.scrollTop = scrollRefB.current.scrollHeight;
    }
  }, [current.pointsB]);

  const membersArrayA = membersA
    ? membersA
        .split(',')
        .map(m => m.trim())
        .filter(Boolean)
    : [];
  const membersArrayB = membersB
    ? membersB
        .split(',')
        .map(m => m.trim())
        .filter(Boolean)
    : [];

  const getCurrentPlayer = () => {
    if (current.turn === 'A') {
      return membersArrayA.length > 0
        ? membersArrayA[current.pointsA.length % membersArrayA.length]
        : null;
    }
    return membersArrayB.length > 0
      ? membersArrayB[current.pointsB.length % membersArrayB.length]
      : null;
  };

  const currentPlayer = getCurrentPlayer();

  const handleScore = (point: number) => {
    setHistory(prev => [
      ...prev,
      current.turn === 'A'
        ? {
            scoreA: current.scoreA + point > 50 ? 25 : current.scoreA + point,
            foulA: point == 0 ? current.foulA + 1 : 0,
            pointsA: [...current.pointsA, point === 0 ? 'ファウル' : point],
            scoreB: current.scoreB,
            foulB: current.foulB,
            pointsB: current.pointsB,
            turn: 'B',
          }
        : {
            scoreA: current.scoreA,
            foulA: current.foulA,
            pointsA: current.pointsA,
            scoreB: current.scoreB + point > 50 ? 25 : current.scoreB + point,
            foulB: point == 0 ? current.foulB + 1 : 0,
            pointsB: [...current.pointsB, point === 0 ? 'ファウル' : point],
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

  const activeModal = winner
    ? { team: winner, type: 'win' as const }
    : loser
      ? { team: loser, type: 'lose' as const }
      : null;

  return (
    <main className="h-screen overflow-hidden flex flex-col items-center pt-2 pb-2 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md h-full flex flex-col items-center text-gray-800 dark:text-gray-100">
        <button
          onClick={onBack}
          className="w-full text-left text-[10px] text-indigo-500 font-bold hover:underline mb-1"
        >
          ← 戻る
        </button>

        <div className="w-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="border-b border-gray-50 dark:border-gray-700">
            {displayTeamScore('A')}
          </div>
          {displayTeamScore('B')}
        </div>

        <div className="w-full p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-2">
          <div className="w-full px-2 py-1 bg-white dark:bg-gray-800 rounded-l">
            <p className="text-sm font-bold">{teamMessage}</p>
            {currentPlayer && <p className="text-sm">プレイヤー：{currentPlayer}</p>}
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
      {activeModal && (
        <GameResultModal team={activeModal.team} type={activeModal.type} onReset={onBack} />
      )}
    </main>
  );

  function renderHistoryTable(
    members: string[],
    points: (number | 'ファウル')[],
    activeIndex?: number,
    scrollRef?: React.RefObject<HTMLDivElement | null>
  ) {
    const playerScores: (number | 'ファウル')[][] = members.map(() => []);
    points.forEach((p, i) => {
      playerScores[i % members.length].push(p);
    });
    const maxRows = Math.max(1, ...playerScores.map(s => s.length));

    return (
      <div ref={scrollRef} className="overflow-x-auto h-[72px] overflow-y-auto pr-1">
        <table className="w-full text-[10px] text-left border-separate border-spacing-0">
          <thead className="sticky top-0 bg-gray-200 dark:bg-gray-600 z-10">
            <tr>
              {members.map((m, i) => (
                <th
                  key={i}
                  className={`py-1 px-1 font-bold truncate max-w-[60px] border-b border-gray-100 dark:border-gray-700 ${
                    i === activeIndex ? 'bg-blue-400 dark:bg-blue-600' : ''
                  }`}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(maxRows)].map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-50 dark:border-gray-800 last:border-0"
              >
                {playerScores.map((scores, colIndex) => (
                  <td
                    key={colIndex}
                    className={`py-1 px-1 ${
                      scores[rowIndex] === 'ファウル'
                        ? 'text-red-500 font-bold'
                        : 'text-gray-600 dark:text-gray-300'
                    } ${colIndex === activeIndex ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    {scores[rowIndex] !== undefined ? scores[rowIndex] : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function displayTeamScore(team: Team) {
    const isA = team === 'A';
    const foulCount = isA ? current.foulA : current.foulB;
    const points = isA ? current.pointsA : current.pointsB;
    const score = isA ? current.scoreA : current.scoreB;
    const label = isA ? 'TEAM A🟥' : 'TEAM B🟦';
    const id = isA ? 'team-a-box' : 'team-b-box';
    const mArray = isA ? membersArrayA : membersArrayB;
    const isCurrentTurn = current.turn === team;
    const activePlayerIndex = isCurrentTurn ? points.length % mArray.length : undefined;
    const scrollRef = isA ? scrollRefA : scrollRefB;

    return (
      <div
        id={id}
        data-testid={id}
        className={`flex-1 p-3 transition-all ${
          isCurrentTurn
            ? 'bg-yellow-100 dark:bg-yellow-900/20 ring-2 ring-inset ring-yellow-500'
            : ''
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{label}</span>
            <div className="flex items-center gap-2">
              {foulCount > 0 && (
                <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                  ファウル：{foulCount}
                </span>
              )}
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{score}点</span>
            </div>
          </div>

          {/* チーム内スコア履歴テーブル */}
          {mArray.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              {renderHistoryTable(mArray, points, activePlayerIndex, scrollRef)}
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

  function GameResultModal({ team, type, onReset }: GameResultModalProps) {
    const isWin = type === 'win';

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white dark:bg-black p-8 rounded-xl shadow-2xl text-center space-y-4">
          <h2 className="text-2xl font-bold">
            {team === 'A' ? '🟥 チームA' : '🟦 チームB'} の{isWin ? '勝利！' : '敗北…'}
          </h2>
          <button
            onClick={onReset}
            className="items-center justify-center h-12 w-24 text-lg font-bold bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl active:scale-95 transition-all border border-green-100 dark:border-green-800"
          >
            もう一度
          </button>
        </div>
      </div>
    );
  }
}
