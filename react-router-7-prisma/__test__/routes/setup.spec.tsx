import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import MemberSetup from '~/routes/setup';

describe('MemberSetup', () => {
  const mockOnStartTwoTeam = vi.fn();
  const mockOnStartThreeTeam = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    const TestWrapper = () => {
      const [members, setMembers] = useState<string[]>([]);
      return (
        <MemberSetup
          onStartTwoTeam={mockOnStartTwoTeam}
          onStartThreeTeam={mockOnStartThreeTeam}
          onBack={mockOnBack}
          members={members}
          setMembers={setMembers}
        />
      );
    };
    return render(<TestWrapper />);
  };

  test('初期状態でタイトルと空のメッセージが表示される', () => {
    setup();
    expect(screen.getByText('メンバー登録')).toBeInTheDocument();
    expect(screen.getByText('名前を追加してください')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2チームに分けて開始' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '3チームに分けて開始' })).toBeDisabled();
  });

  test('メンバーを追加できる', async () => {
    const user = userEvent.setup();
    setup();
    const input = screen.getByPlaceholderText('名前を入力');
    const addButton = screen.getByRole('button', { name: '追加' });

    await user.type(input, 'プレイヤー1');
    await user.click(addButton);

    expect(await screen.findByText('プレイヤー1')).toBeInTheDocument();
    expect(await screen.findByText('参加者一覧 (1名)')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  test('メンバーを削除できる', async () => {
    const user = userEvent.setup();
    setup();
    const input = screen.getByPlaceholderText('名前を入力');
    const addButton = screen.getByRole('button', { name: '追加' });

    await user.type(input, 'プレイヤー1');
    await user.click(addButton);

    const removeButton = screen.getByRole('button', { name: '×' });
    await user.click(removeButton);

    await waitFor(() => expect(screen.queryByText('プレイヤー1')).not.toBeInTheDocument());
    expect(screen.getByText('参加者一覧 (0名)')).toBeInTheDocument();
    expect(screen.getByText('名前を追加してください')).toBeInTheDocument();
  });

  test('参加人数に応じて開始ボタンの有効状態が切り替わる', async () => {
    const user = userEvent.setup();
    setup();
    const input = screen.getByPlaceholderText('名前を入力');
    const addButton = screen.getByRole('button', { name: '追加' });

    // 2人追加
    await user.type(input, 'A');
    await user.click(addButton);
    expect(screen.getByText('A')).toBeInTheDocument();
    await user.type(input, 'B');
    await user.click(addButton);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2チームに分けて開始' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '3チームに分けて開始' })).toBeDisabled();

    // 3人目追加
    await user.type(input, 'C');
    await user.click(addButton);
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3チームに分けて開始' })).toBeEnabled();
  });

  test('「ホームに戻る」ボタンを押すと onBack が呼ばれる', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'ホームに戻る' }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  test('Enterキーでメンバーを追加できる', async () => {
    const user = userEvent.setup();
    setup();
    const input = screen.getByPlaceholderText('名前を入力');
    await user.type(input, 'Enterテスト{Enter}');
    expect(screen.getByText('Enterテスト')).toBeInTheDocument();
  });
});
