import { useState } from 'react';

interface MemberSetupProps {
  members: string[];
  setMembers: React.Dispatch<React.SetStateAction<string[]>>;
  onStartTwoTeam: (membersA: string, membersB: string) => void;
  onStartThreeTeam: (membersA: string, membersB: string, membersC: string) => void;
  onBack: () => void;
}

export default function MemberSetup({
  members,
  setMembers,
  onStartTwoTeam,
  onStartThreeTeam,
  onBack,
}: MemberSetupProps) {
  const [newMember, setNewMember] = useState('');

  const addMember = () => {
    if (newMember.trim()) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const startGame = (numTeams: 2 | 3) => {
    if (members.length < numTeams) {
      alert(`${numTeams}人以上のメンバーを登録してください`);
      return;
    }

    const shuffled = [...members].sort(() => Math.random() - 0.5);

    if (numTeams === 2) {
      const mid = Math.ceil(shuffled.length / 2);
      onStartTwoTeam(shuffled.slice(0, mid).join(', '), shuffled.slice(mid).join(', '));
    } else {
      const size = Math.ceil(shuffled.length / 3);
      onStartThreeTeam(
        shuffled.slice(0, size).join(', '),
        shuffled.slice(size, size * 2).join(', '),
        shuffled.slice(size * 2).join(', ')
      );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-8 pb-4 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md flex flex-col items-center gap-4 text-gray-800 dark:text-gray-100">
        <header className="w-full flex flex-col items-center py-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-xl font-bold">メンバー登録</h1>
        </header>

        <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newMember}
              onChange={e => setNewMember(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMember()}
              placeholder="名前を入力"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addMember}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-bold"
            >
              追加
            </button>
          </div>

          <div className="space-y-3 mb-8">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 border-b pb-1">
              参加者一覧 ({members.length}名)
            </h2>
            <div className="flex flex-wrap gap-2">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium"
                >
                  <span>{member}</span>
                  <button
                    onClick={() => removeMember(index)}
                    className="text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm text-gray-400 italic">名前を追加してください</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => startGame(2)}
              disabled={members.length < 2}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold disabled:opacity-30 shadow-lg"
            >
              2チームに分けて開始
            </button>
            <button
              onClick={() => startGame(3)}
              disabled={members.length < 3}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold disabled:opacity-30 shadow-lg"
            >
              3チームに分けて開始
            </button>
          </div>
        </div>

        <button
          onClick={onBack}
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline mt-4"
        >
          ホームに戻る
        </button>
      </div>
    </main>
  );
}
