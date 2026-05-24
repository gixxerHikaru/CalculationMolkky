import { render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { assert, expect, test } from 'vitest';
import { createRoutesStub } from 'react-router';
import { describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import CalculationMolkkyThreeTeam, { type Team } from '~/routes/CalculationMolkkyThreeTeam';

const testMembersA = 'プレイヤー1, プレイヤー2';
const testMembersB = 'プレイヤー3, プレイヤー4';
const testMembersC = 'プレイヤー5, プレイヤー6';

const Stub = createRoutesStub([
  {
    path: '/',
    Component: () => {
      const [showSetup, setShowSetup] = useState(false);
      if (showSetup)
        return (
          <div>
            <div>メンバー登録</div>
            <p>{testMembersA}</p>
            <p>{testMembersB}</p>
            <p>{testMembersC}</p>
          </div>
        );
      return (
        <CalculationMolkkyThreeTeam
          membersA={testMembersA}
          membersB={testMembersB}
          membersC={testMembersC}
          onBack={() => setShowSetup(true)}
        />
      );
    },
  },
]);

describe('初期表示', () => {
  test('3チームの合計得点が見える', () => {
    render(<Stub initialEntries={['/']} />);
    const sectionA = screen.getByTestId('team-a-box');
    expect(within(sectionA).getByText('TEAM A🟥')).toBeInTheDocument();
    expect(sectionA).toHaveTextContent('0点');
    const sectionB = screen.getByTestId('team-b-box');
    expect(within(sectionB).getByText('TEAM B🟦')).toBeInTheDocument();
    expect(sectionB).toHaveTextContent('0点');
    const sectionC = screen.getByTestId('team-c-box');
    expect(within(sectionC).getByText('TEAM C🟩')).toBeInTheDocument();
    expect(sectionC).toHaveTextContent('0点');
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

  test('渡されたメンバー名が各チームのボックスに表示される', () => {
    render(<Stub initialEntries={['/']} />);

    const sectionA = screen.getByTestId('team-a-box');
    expect(within(sectionA).getByText('プレイヤー1')).toBeInTheDocument();
    expect(within(sectionA).getByText('プレイヤー2')).toBeInTheDocument();

    const sectionB = screen.getByTestId('team-b-box');
    expect(within(sectionB).getByText('プレイヤー3')).toBeInTheDocument();
    expect(within(sectionB).getByText('プレイヤー4')).toBeInTheDocument();

    const sectionC = screen.getByTestId('team-c-box');
    expect(within(sectionC).getByText('プレイヤー5')).toBeInTheDocument();
    expect(within(sectionC).getByText('プレイヤー6')).toBeInTheDocument();
  });

  describe('戻るボタン', () => {
    test('ユーザーが登録された状態で、「← 戻る」ボタンを押すとユーザー登録画面に遷移し登録されたメンバーが表示される', async () => {
      render(<Stub initialEntries={['/']} />);

      const backButton = screen.getByText('← 戻る');
      await userEvent.click(backButton);

      expect(await screen.findByText('メンバー登録')).toBeInTheDocument();
      expect(await screen.findByText(testMembersA)).toBeInTheDocument();
      expect(await screen.findByText(testMembersB)).toBeInTheDocument();
      expect(await screen.findByText(testMembersC)).toBeInTheDocument();
    });

    test('ユーザーが登録されていない状態で、「← 戻る」ボタンを押すと初期画面に遷移する', async () => {
      const StubNoMembers = createRoutesStub([
        {
          path: '/',
          Component: () => {
            const [view, setView] = useState('GAME');
            if (view === 'MENU') return <div>モルック・スコア計算</div>;
            return (
              <CalculationMolkkyThreeTeam
                membersA={null}
                membersB={null}
                membersC={null}
                onBack={() => setView('MENU')}
              />
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
});

describe('スコアの更新', () => {
  async function assertTeamScore(team: Team, expectedScore: number) {
    const teamBox = await screen.findByTestId(
      team === 'A' ? 'team-a-box' : team === 'B' ? 'team-b-box' : 'team-c-box'
    );

    const scoreElement = await within(teamBox).findByText(new RegExp(`${expectedScore}点`));

    assert.exists(scoreElement, `チーム${team}のスコアが${expectedScore}点であること`);
  }

  async function assertState(expectedA: number, expectedB: number, expectedC: number) {
    await assertTeamScore('A', expectedA);
    await assertTeamScore('B', expectedB);
    await assertTeamScore('C', expectedC);
  }

  async function assertTeamState(team: Team, expectedScore: number, expectedFoul: number) {
    const teamId = team === 'A' ? 'team-a-box' : team === 'B' ? 'team-b-box' : 'team-c-box';
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

  async function playAndAssert(
    point: number,
    expectedA: number,
    expectedB: number,
    expectedC: number
  ) {
    const button = await screen.findByRole('button', { name: `${point}点` });
    await user.click(button);
    await assertState(expectedA, expectedB, expectedC);
  }

  async function clickBackAndAssert(expectedA: number, expectedB: number, expectedC: number) {
    const button = await screen.findByRole('button', { name: '戻る' });
    await user.click(button);
    await assertState(expectedA, expectedB, expectedC);
  }

  test('チームA→B→Cの順番で得点し、スコアと攻撃権、プレイヤーが正しく遷移する', async () => {
    render(<Stub initialEntries={['/']} />);

    const steps = [
      { point: 12, a: 12, b: 0, c: 0 },
      { point: 11, a: 12, b: 11, c: 0 },
      { point: 10, a: 12, b: 11, c: 10 },
      { point: 9, a: 21, b: 11, c: 10 },
      { point: 8, a: 21, b: 19, c: 10 },
      { point: 7, a: 21, b: 19, c: 17 },
    ];
    const expectedPlayers = [
      'プレイヤー：プレイヤー1',
      'プレイヤー：プレイヤー3',
      'プレイヤー：プレイヤー5',
      'プレイヤー：プレイヤー2',
      'プレイヤー：プレイヤー4',
      'プレイヤー：プレイヤー6',
    ];

    for (let i = 0; i < steps.length; i++) {
      expect(await screen.findByText(expectedPlayers[i])).toBeInTheDocument();
      await playAndAssert(steps[i].point, steps[i].a, steps[i].b, steps[i].c);
    }
  });

  test('番手のチームの合計スコアにハイライトが当たり、そうでないチームにはつかない', async () => {
    render(<Stub initialEntries={['/']} />);

    await waitFor(async () => {
      const teamABox = await screen.findByTestId('team-a-box');
      expect(teamABox).toHaveClass('bg-yellow-100');
    });

    await playAndAssert(5, 5, 0, 0);

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
    await assertTeamState('C', 0, 0);

    await user.click(foulButton);
    expect(await screen.findByText('🟩チームCの番です')).toBeInTheDocument();
    await assertTeamState('A', 0, 1);
    await assertTeamState('B', 0, 1);
    await assertTeamState('C', 0, 0);
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
    await assertTeamState('C', 0, 0);

    assert.isOk(await screen.findByText('🟩チームCの番です'));
    await user.click(foulButton);
    await assertTeamState('A', 0, 1);
    await assertTeamState('B', 0, 1);
    await assertTeamState('C', 0, 1);

    assert.isOk(await screen.findByText('🟥チームAの番です'));
    await playAndAssert(5, 5, 0, 0);
    await assertTeamState('A', 5, 0);
    await assertTeamState('B', 0, 1);
    await assertTeamState('C', 0, 1);

    assert.isOk(await screen.findByText('🟦チームBの番です'));
  });

  test('戻るボタンを押すと、前の状態に戻る', async () => {
    render(<Stub initialEntries={['/']} />);

    const firstStep = [5, 0, 0] as const;
    await playAndAssert(5, ...firstStep);
    const secondStep = [5, 3, 0] as const;
    await playAndAssert(3, ...secondStep);
    const thirdStep = [5, 3, 1] as const;
    await playAndAssert(1, ...thirdStep);

    await clickBackAndAssert(...secondStep);
    await clickBackAndAssert(...firstStep);
    await clickBackAndAssert(0, 0, 0);
  });

  test('50点を超えると、超えた側のスコアが25点にリセットされ、攻撃権が移る', async () => {
    render(<Stub initialEntries={['/']} />);
    const steps = [
      { point: 12, a: 12, b: 0, c: 0 },
      { point: 12, a: 12, b: 12, c: 0 },
      { point: 12, a: 12, b: 12, c: 12 },
      { point: 12, a: 24, b: 12, c: 12 },
      { point: 12, a: 24, b: 24, c: 12 },
      { point: 12, a: 24, b: 24, c: 24 },
      { point: 12, a: 36, b: 24, c: 24 },
      { point: 12, a: 36, b: 36, c: 24 },
      { point: 12, a: 36, b: 36, c: 36 },
      { point: 12, a: 48, b: 36, c: 36 },
      { point: 12, a: 48, b: 48, c: 36 },
      { point: 12, a: 48, b: 48, c: 48 },
    ];
    for (const step of steps) {
      await playAndAssert(step.point, step.a, step.b, step.c);
    }

    await playAndAssert(12, 25, 48, 48);
    await playAndAssert(12, 25, 25, 48);
    await playAndAssert(12, 25, 25, 25);
  });

  describe('勝利条件', () => {
    test('50点丁度の場合は勝利モーダルが表示される', async () => {
      render(<Stub initialEntries={['/']} />);
      const steps = [
        { point: 12, a: 12, b: 0, c: 0 },
        { point: 12, a: 12, b: 12, c: 0 },
        { point: 12, a: 12, b: 12, c: 12 },
        { point: 12, a: 24, b: 12, c: 12 },
        { point: 12, a: 24, b: 24, c: 12 },
        { point: 12, a: 24, b: 24, c: 24 },
        { point: 12, a: 36, b: 24, c: 24 },
        { point: 12, a: 36, b: 36, c: 24 },
        { point: 12, a: 36, b: 36, c: 36 },
        { point: 12, a: 48, b: 36, c: 36 },
        { point: 12, a: 48, b: 48, c: 36 },
        { point: 12, a: 48, b: 48, c: 48 },
      ];
      for (const step of steps) {
        await playAndAssert(step.point, step.a, step.b, step.c);
      }

      await playAndAssert(2, 50, 48, 48);

      const winMsg = await screen.findByText('🟥 チームA の勝利！');
      assert.exists(winMsg);
    });

    test('50点丁度の場合は勝利モーダルが表示される', async () => {
      render(<Stub initialEntries={['/']} />);
      const steps = [
        { point: 1, a: 1, b: 0, c: 0 },
        { point: 1, a: 1, b: 1, c: 0 },
        { point: 12, a: 1, b: 1, c: 12 },
        { point: 1, a: 2, b: 1, c: 12 },
        { point: 1, a: 2, b: 2, c: 12 },
        { point: 12, a: 2, b: 2, c: 24 },
        { point: 1, a: 3, b: 2, c: 24 },
        { point: 1, a: 3, b: 3, c: 24 },
        { point: 12, a: 3, b: 3, c: 36 },
        { point: 1, a: 4, b: 3, c: 36 },
        { point: 1, a: 4, b: 4, c: 36 },
        { point: 12, a: 4, b: 4, c: 48 },
        { point: 1, a: 5, b: 4, c: 48 },
        { point: 1, a: 5, b: 5, c: 48 },
      ];
      for (const step of steps) {
        await playAndAssert(step.point, step.a, step.b, step.c);
      }

      await playAndAssert(2, 5, 5, 50);

      const winMsg = await screen.findByText('🟩 チームC の勝利！');
      assert.exists(winMsg);
    });

    test('モーダルには「もう一度」ボタンがあり、押すと初期状態からゲームができる画面になる', async () => {
      render(<Stub initialEntries={['/']} />);
      const steps = [
        { point: 1, a: 1, b: 0, c: 0 },
        { point: 12, a: 1, b: 12, c: 0 },
        { point: 1, a: 1, b: 12, c: 1 },
        { point: 1, a: 2, b: 12, c: 1 },
        { point: 12, a: 2, b: 24, c: 1 },
        { point: 1, a: 2, b: 24, c: 2 },
        { point: 1, a: 3, b: 24, c: 2 },
        { point: 12, a: 3, b: 36, c: 2 },
        { point: 1, a: 3, b: 36, c: 3 },
        { point: 1, a: 4, b: 36, c: 3 },
        { point: 12, a: 4, b: 48, c: 3 },
        { point: 1, a: 4, b: 48, c: 4 },
        { point: 1, a: 5, b: 48, c: 4 },
      ];
      for (const step of steps) {
        await playAndAssert(step.point, step.a, step.b, step.c);
      }
      await playAndAssert(2, 5, 50, 4);

      const winMsg = await screen.findByText('🟦 チームB の勝利！');
      assert.exists(winMsg);

      const resetButton = await screen.findByRole('button', { name: 'もう一度' });
      await user.click(resetButton);

      expect(await screen.findByText('メンバー登録')).toBeInTheDocument();
    });
  });

  describe('敗北条件', () => {
    test('ファウルが3回になると、そのチームの敗北が表示される', async () => {
      render(<Stub initialEntries={['/']} />);

      const foulButton = await screen.findByRole('button', { name: 'ファウル' });

      await user.click(foulButton);
      await playAndAssert(1, 0, 1, 0);
      await playAndAssert(1, 0, 1, 1);
      await user.click(foulButton);
      await playAndAssert(1, 0, 2, 1);
      await playAndAssert(1, 0, 2, 2);
      await user.click(foulButton);

      const loseMsg = await screen.findByText('🟥 チームA の敗北…');
      assert.exists(loseMsg);
    });
    test('ファウルが3回になると、そのチームの敗北が表示される', async () => {
      render(<Stub initialEntries={['/']} />);

      const foulButton = await screen.findByRole('button', { name: 'ファウル' });

      await playAndAssert(1, 1, 0, 0);
      await playAndAssert(1, 1, 1, 0);
      await user.click(foulButton);
      await playAndAssert(1, 2, 1, 0);
      await playAndAssert(1, 2, 2, 0);
      await user.click(foulButton);
      await playAndAssert(1, 3, 2, 0);
      await playAndAssert(1, 3, 3, 0);
      await user.click(foulButton);

      const loseMsg = await screen.findByText('🟩 チームC の敗北…');
      assert.exists(loseMsg);
    });
    test('モーダルには「他のチームのために継続」ボタンがあり、押すと次のチームからゲームができる画面になる', async () => {
      render(<Stub initialEntries={['/']} />);
      const foulButton = await screen.findByRole('button', { name: 'ファウル' });

      await playAndAssert(1, 1, 0, 0);
      await user.click(foulButton);
      await playAndAssert(1, 1, 0, 1);
      await playAndAssert(1, 2, 0, 1);
      await user.click(foulButton);
      await playAndAssert(1, 2, 0, 2);
      await playAndAssert(1, 3, 0, 2);
      await user.click(foulButton);

      const loseMsg = await screen.findByText('🟦 チームB の敗北…');
      assert.exists(loseMsg);

      const resetButton = await screen.findByRole('button', { name: '他のチームのために継続' });
      await user.click(resetButton);

      expect(screen.getByText('🟩チームCの番です'));
      assertTeamState('A', 3, 0);
      assertTeamState('B', 0, 3);
      assertTeamState('C', 2, 0);
    });

    test('敗北したチームは番が来てもスキップされる', async () => {
      render(<Stub initialEntries={['/']} />);
      const foulButton = await screen.findByRole('button', { name: 'ファウル' });

      await playAndAssert(1, 1, 0, 0);
      await user.click(foulButton);
      await playAndAssert(1, 1, 0, 1);
      await playAndAssert(1, 2, 0, 1);
      await user.click(foulButton);
      await playAndAssert(1, 2, 0, 2);
      await playAndAssert(1, 3, 0, 2);
      await user.click(foulButton);

      const loseMsg = await screen.findByText('🟦 チームB の敗北…');
      assert.exists(loseMsg);
      const continueButton = await screen.findByRole('button', { name: '他のチームのために継続' });
      await user.click(continueButton);
      expect(screen.queryByText('🟦 チームB の敗北…')).toBeNull();

      expect(await screen.findByText('🟩チームCの番です'));
      await playAndAssert(1, 3, 0, 3);
      expect(await screen.findByText('🟥チームAの番です'));
      await playAndAssert(1, 4, 0, 3);

      expect(screen.queryByText('🟦チームBの番です')).toBeNull();
      expect(await screen.findByText('🟩チームCの番です'));
    });

    test('敗北したチームは戻るボタンを押されて敗北状態じゃなくなれば、番が来てもスキップされない', async () => {
      render(<Stub initialEntries={['/']} />);
      const foulButton = await screen.findByRole('button', { name: 'ファウル' });

      await playAndAssert(1, 1, 0, 0);
      await user.click(foulButton);
      await playAndAssert(1, 1, 0, 1);
      await playAndAssert(1, 2, 0, 1);
      await user.click(foulButton);
      await playAndAssert(1, 2, 0, 2);
      await playAndAssert(1, 3, 0, 2);
      await user.click(foulButton);

      const loseMsg = await screen.findByText('🟦 チームB の敗北…');
      assert.exists(loseMsg);
      const continueButton = await screen.findByRole('button', { name: '他のチームのために継続' });
      await user.click(continueButton);

      expect(await screen.findByText('🟩チームCの番です'));
      await clickBackAndAssert(3, 0, 2);
      expect(await screen.findByText('🟦チームBの番です'));
      await clickBackAndAssert(2, 0, 2);

      expect(await screen.findByText('🟥チームAの番です'));
      await playAndAssert(2, 4, 0, 2);
      expect(await screen.findByText('🟦チームBの番です'));
    });

    test('2チームが敗北している場合は、残った1チームの勝利が表示される', async () => {
      render(<Stub initialEntries={['/']} />);
      const foulButton = await screen.findByRole('button', { name: 'ファウル' });

      await playAndAssert(1, 1, 0, 0);
      await user.click(foulButton);
      await playAndAssert(1, 1, 0, 1);
      await playAndAssert(1, 2, 0, 1);
      await user.click(foulButton);
      await playAndAssert(1, 2, 0, 2);
      await playAndAssert(1, 3, 0, 2);
      await user.click(foulButton);

      const loseMsgB = await screen.findByText('🟦 チームB の敗北…');
      assert.exists(loseMsgB);
      const continueButtonB = await screen.findByRole('button', { name: '他のチームのために継続' });
      await user.click(continueButtonB);

      await user.click(foulButton);
      await playAndAssert(1, 4, 0, 2);
      await user.click(foulButton);
      await playAndAssert(1, 5, 0, 2);
      await user.click(foulButton);

      expect(screen.queryByText('🟩 チームC の敗北…')).toBeNull();
      const winMsg = await screen.findByText('🟥 チームA の勝利！');
      assert.exists(winMsg);
    });
  });
});
