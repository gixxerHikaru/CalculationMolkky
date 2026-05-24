import { render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { assert, expect, test } from 'vitest';
import { createRoutesStub } from 'react-router';
import CalculationMolkky from '~/routes/CalculationMolkky';
import { describe } from 'vitest';
import userEvent from '@testing-library/user-event';

const testMembersA = 'プレイヤー1, プレイヤー2';
const testMembersB = 'プレイヤー3, プレイヤー4';

const Stub = createRoutesStub([
  {
    path: '/',
    Component: () => {
      const [showSetup, setShowSetup] = useState(false);
      if (showSetup)
        return (
          <div>
            <h1>メンバー登録</h1>
            <p>{testMembersA}</p>
            <p>{testMembersB}</p>
          </div>
        );
      return (
        <CalculationMolkky
          membersA={testMembersA}
          membersB={testMembersB}
          onBack={() => setShowSetup(true)}
        />
      );
    },
  },
]);

describe('初期表示', () => {
  test('2チームの合計得点が見える', () => {
    render(<Stub initialEntries={['/']} />);
    const sectionA = screen.getByTestId('team-a-box');
    expect(within(sectionA).getByText('TEAM A🟥')).toBeInTheDocument();
    expect(sectionA).toHaveTextContent('0点');
    const sectionB = screen.getByTestId('team-b-box');
    expect(within(sectionB).getByText('TEAM B🟦')).toBeInTheDocument();
    expect(sectionB).toHaveTextContent('0点');
  });

  test('渡されたメンバー名が各チームのボックスに表示される', () => {
    render(<Stub initialEntries={['/']} />);

    const sectionA = screen.getByTestId('team-a-box');
    expect(within(sectionA).getByText('プレイヤー1')).toBeInTheDocument();
    expect(within(sectionA).getByText('プレイヤー2')).toBeInTheDocument();

    const sectionB = screen.getByTestId('team-b-box');
    expect(within(sectionB).getByText('プレイヤー3')).toBeInTheDocument();
    expect(within(sectionB).getByText('プレイヤー4')).toBeInTheDocument();
  });

  describe('戻るボタン', () => {
    test('ユーザーが登録された状態で、「← 戻る」ボタンを押すとユーザー登録画面に遷移し登録されたメンバーが表示される', async () => {
      render(<Stub initialEntries={['/']} />);

      const backButton = screen.getByText('← 戻る');
      await userEvent.click(backButton);

      expect(await screen.findByText('メンバー登録')).toBeInTheDocument();
      expect(await screen.findByText(testMembersA)).toBeInTheDocument();
      expect(await screen.findByText(testMembersB)).toBeInTheDocument();
    });

    test('ユーザーが登録されていない状態で、「← 戻る」ボタンを押すと初期画面に遷移する', async () => {
      const StubNoMembers = createRoutesStub([
        {
          path: '/',
          Component: () => {
            const [view, setView] = useState('GAME');
            if (view === 'MENU') return <div>モルック・スコア計算</div>;
            return (
              <CalculationMolkky membersA={null} membersB={null} onBack={() => setView('MENU')} />
            );
          },
        },
      ]);
      render(<StubNoMembers initialEntries={['/']} />);

      const backButton = screen.getByText('← 戻る');
      await userEvent.click(backButton);

      expect(await screen.findByText('モルック・スコア計算')).toBeInTheDocument();
    });
  });

  test('1~12のスコアボタンとFoulボタンが見える', () => {
    render(<Stub initialEntries={['/']} />);
    expect(screen.getByRole('button', { name: '1点' }));
    expect(screen.getByRole('button', { name: '2点' }));
    expect(screen.getByRole('button', { name: '3点' }));
    expect(screen.getByRole('button', { name: '4点' }));
    expect(screen.getByRole('button', { name: '5点' }));
    expect(screen.getByRole('button', { name: '6点' }));
    expect(screen.getByRole('button', { name: '7点' }));
    expect(screen.getByRole('button', { name: '8点' }));
    expect(screen.getByRole('button', { name: '9点' }));
    expect(screen.getByRole('button', { name: '10点' }));
    expect(screen.getByRole('button', { name: '11点' }));
    expect(screen.getByRole('button', { name: '12点' }));
    expect(screen.getByRole('button', { name: 'ファウル' }));
    expect(screen.getByRole('button', { name: '戻る' }));
  });

  test('チームAの番ですと、投げるプレイヤーがわかる', () => {
    render(<Stub initialEntries={['/']} />);
    expect(screen.getByText('🟥チームAの番です')).toBeInTheDocument();
    expect(screen.getByText('プレイヤー：プレイヤー1')).toBeInTheDocument();
  });
});

describe('スコアの更新', () => {
  async function assertTeamScore(team: 'A' | 'B', expectedScore: number) {
    const teamBox = await screen.findByTestId(team === 'A' ? 'team-a-box' : 'team-b-box');

    const scoreElement = await within(teamBox).findByText(new RegExp(`${expectedScore}点`));

    assert.exists(scoreElement, `チーム${team}のスコアが${expectedScore}点であること`);
  }

  async function assertState(expectedA: number, expectedB: number) {
    await assertTeamScore('A', expectedA);
    await assertTeamScore('B', expectedB);
  }

  async function assertTeamState(team: 'A' | 'B', expectedScore: number, expectedFoul: number) {
    const teamId = team === 'A' ? 'team-a-box' : 'team-b-box';
    const teamBox = await screen.findByTestId(teamId);

    const scoreEl = await within(teamBox).findByText(new RegExp(`${expectedScore}点`));
    assert.exists(scoreEl);

    if (expectedFoul > 0) {
      const foulEl = await within(teamBox).findByText(new RegExp(`ファウル：${expectedFoul}`));
      assert.exists(foulEl);
    } else {
      assert.isNull(within(teamBox).queryByText(/ファウル：/));
    }
  }

  const user = userEvent.setup();

  async function playAndAssert(point: number, expectedA: number, expectedB: number) {
    const button = await screen.findByRole('button', { name: `${point}点` });
    await user.click(button);
    await assertState(expectedA, expectedB);
  }

  async function clickBackAndAssert(expectedA: number, expectedB: number) {
    const button = await screen.findByRole('button', { name: '戻る' });
    await user.click(button);
    await assertState(expectedA, expectedB);
  }

  test('チームAとチームBが交互に得点し、スコアと攻撃権、プレイヤーが正しく遷移する', async () => {
    render(<Stub initialEntries={['/']} />);

    const steps = [
      { point: 12, a: 12, b: 0 },
      { point: 11, a: 12, b: 11 },
      { point: 10, a: 22, b: 11 },
      { point: 9, a: 22, b: 20 },
      { point: 8, a: 30, b: 20 },
      { point: 7, a: 30, b: 27 },
      { point: 6, a: 36, b: 27 },
      { point: 5, a: 36, b: 32 },
      { point: 4, a: 40, b: 32 },
      { point: 3, a: 40, b: 35 },
      { point: 2, a: 42, b: 35 },
      { point: 1, a: 42, b: 36 },
    ];

    const expectedPlayers = [
      'プレイヤー：プレイヤー1',
      'プレイヤー：プレイヤー3',
      'プレイヤー：プレイヤー2',
      'プレイヤー：プレイヤー4',
      'プレイヤー：プレイヤー1',
      'プレイヤー：プレイヤー3',
      'プレイヤー：プレイヤー2',
      'プレイヤー：プレイヤー4',
      'プレイヤー：プレイヤー1',
      'プレイヤー：プレイヤー3',
      'プレイヤー：プレイヤー2',
      'プレイヤー：プレイヤー4',
    ];

    for (let i = 0; i < steps.length; i++) {
      expect(await screen.findByText(expectedPlayers[i])).toBeInTheDocument();
      await playAndAssert(steps[i].point, steps[i].a, steps[i].b);
    }
  });

  test('番手のチームの合計スコアにハイライトが当たり、そうでないチームにはつかない', async () => {
    render(<Stub initialEntries={['/']} />);

    await waitFor(async () => {
      const teamABox = await screen.findByTestId('team-a-box');
      expect(teamABox).toHaveClass('bg-yellow-100');
    });

    await playAndAssert(5, 5, 0);

    await waitFor(async () => {
      const teamBBox = await screen.findByTestId('team-b-box');
      expect(teamBBox).toHaveClass('bg-yellow-100');
    });
  });

  test('ファウルボタンを押すと、得点は加算されずに攻撃権が移り、合計スコアの下にファウル回数が表示される', async () => {
    render(<Stub initialEntries={['/']} />);

    const foulButton = await screen.findByRole('button', { name: 'ファウル' });

    await user.click(foulButton);

    expect(await screen.findByText('🟦チームBの番です')).toBeInTheDocument();
    await assertTeamState('A', 0, 1);
    await assertTeamState('B', 0, 0);
  });

  test('ファウル回数が表示されている状態で、得点をすると得点した側のファウル回数がリセットされる', async () => {
    render(<Stub initialEntries={['/']} />);

    const foulButton = await screen.findByRole('button', { name: 'ファウル' });

    await user.click(foulButton);
    await assertTeamState('A', 0, 1);

    assert.isOk(await screen.findByText('🟦チームBの番です'));
    await user.click(foulButton);

    await assertTeamState('A', 0, 1);
    await assertTeamState('B', 0, 1);

    assert.isOk(await screen.findByText('🟥チームAの番です'));
    await playAndAssert(5, 5, 0);

    await assertTeamState('A', 5, 0);
    await assertTeamState('B', 0, 1);
  });

  test('戻るボタンを押すと、前の状態に戻る', async () => {
    render(<Stub initialEntries={['/']} />);
    await playAndAssert(5, 5, 0);
    await playAndAssert(3, 5, 3);

    await clickBackAndAssert(5, 0);
    await clickBackAndAssert(0, 0);
  });

  test('50点を超えると、超えた側のスコアが25点にリセットされ、攻撃権が移る', async () => {
    render(<Stub initialEntries={['/']} />);
    const steps = [
      { point: 12, a: 12, b: 0 },
      { point: 12, a: 12, b: 12 },
      { point: 12, a: 24, b: 12 },
      { point: 12, a: 24, b: 24 },
      { point: 12, a: 36, b: 24 },
      { point: 12, a: 36, b: 36 },
      { point: 12, a: 48, b: 36 },
      { point: 12, a: 48, b: 48 },
    ];
    for (const step of steps) {
      await playAndAssert(step.point, step.a, step.b);
    }

    await playAndAssert(12, 25, 48);
    await playAndAssert(12, 25, 25);
  });

  describe('試合終了のアクション', () => {
    describe('勝利条件', () => {
      test('50点丁度の場合は勝利モーダルが表示される', async () => {
        render(<Stub initialEntries={['/']} />);
        const steps = [
          { point: 12, a: 12, b: 0 },
          { point: 12, a: 12, b: 12 },
          { point: 12, a: 24, b: 12 },
          { point: 12, a: 24, b: 24 },
          { point: 12, a: 36, b: 24 },
          { point: 12, a: 36, b: 36 },
          { point: 12, a: 48, b: 36 },
          { point: 12, a: 48, b: 48 },
        ];
        for (const step of steps) {
          await playAndAssert(step.point, step.a, step.b);
        }

        await playAndAssert(2, 50, 48);

        const winMsg = await screen.findByText('🟥 チームA の勝利！');
        assert.exists(winMsg);
      });

      test('50点丁度の場合は勝利モーダルが表示される', async () => {
        render(<Stub initialEntries={['/']} />);
        const steps = [
          { point: 1, a: 1, b: 0 },
          { point: 12, a: 1, b: 12 },
          { point: 1, a: 2, b: 12 },
          { point: 12, a: 2, b: 24 },
          { point: 1, a: 3, b: 24 },
          { point: 12, a: 3, b: 36 },
          { point: 1, a: 4, b: 36 },
          { point: 12, a: 4, b: 48 },
          { point: 1, a: 5, b: 48 },
        ];
        for (const step of steps) {
          await playAndAssert(step.point, step.a, step.b);
        }

        await playAndAssert(2, 5, 50);

        const winMsg = await screen.findByText('🟦 チームB の勝利！');
        assert.exists(winMsg);
      });
    });

    describe('敗北条件', () => {
      test('ファウルが3回になると、そのチームの敗北が表示される', async () => {
        render(<Stub initialEntries={['/']} />);

        const foulButton = await screen.findByRole('button', { name: 'ファウル' });

        await user.click(foulButton);
        await playAndAssert(1, 0, 1);
        await user.click(foulButton);
        await playAndAssert(1, 0, 2);
        await user.click(foulButton);

        const loseMsg = await screen.findByText('🟥 チームA の敗北…');
        assert.exists(loseMsg);
      });
      test('ファウルが3回になると、そのチームの敗北が表示される', async () => {
        render(<Stub initialEntries={['/']} />);

        const foulButton = await screen.findByRole('button', { name: 'ファウル' });

        await playAndAssert(1, 1, 0);
        await user.click(foulButton);
        await playAndAssert(1, 2, 0);
        await user.click(foulButton);
        await playAndAssert(1, 3, 0);
        await user.click(foulButton);

        const loseMsg = await screen.findByText('🟦 チームB の敗北…');
        assert.exists(loseMsg);
      });
    });

    test('もう一度」ボタンを押すと、メンバー登録画面に戻る', async () => {
      render(<Stub initialEntries={['/']} />);
      const steps = [
        { point: 12, a: 12, b: 0 },
        { point: 12, a: 12, b: 12 },
        { point: 12, a: 24, b: 12 },
        { point: 12, a: 24, b: 24 },
        { point: 12, a: 36, b: 24 },
        { point: 12, a: 36, b: 36 },
        { point: 12, a: 48, b: 36 },
        { point: 12, a: 48, b: 48 },
      ];
      for (const step of steps) {
        await playAndAssert(step.point, step.a, step.b);
      }
      await playAndAssert(2, 50, 48);

      const winMsg = await screen.findByText('🟥 チームA の勝利！');
      assert.exists(winMsg);

      const resetButton = await screen.findByRole('button', { name: 'もう一度' });
      await user.click(resetButton);

      expect(await screen.findByText('メンバー登録')).toBeInTheDocument();
    });
  });
});
