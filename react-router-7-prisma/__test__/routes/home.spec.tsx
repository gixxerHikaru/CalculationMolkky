import { render, screen, within } from '@testing-library/react';
import { assert, expect, test } from 'vitest';
import Home from '../../app/routes/home';
import { createRoutesStub } from 'react-router';
import { CalculationMolkky } from '~/routes/CalculationMolkky';
import { describe } from 'vitest';
import userEvent from '@testing-library/user-event';

const Stub = createRoutesStub([
  {
    path: '/',
    Component: Home,
    children: [
      {
        path: 'calculation_molkky',
        Component: CalculationMolkky,
      },
    ],
  },
]);

describe('初期表示', () => {
  test('「モルック・スコア計算」のタイトルが見える', () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);

    expect(screen.getByText('モルック・スコア計算'));
  });

  test('2チームの合計得点が見える', () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);
    expect(screen.getByText('TEAM A🟥'));
    const sectionA = screen.getByText('TEAM A🟥').closest('div');
    expect(sectionA).toHaveTextContent('0点');
    expect(screen.getByText('VS'));
    expect(screen.getByText('TEAM B🟦'));
    const sectionB = screen.getByText('TEAM B🟦').closest('div');
    expect(sectionB).toHaveTextContent('0点');
  });

  test('1~12のスコアボタンとFoulボタンが見える', () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);
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

  test('チームAの番ですが見える', () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);
    expect(screen.getByText('🟥チームAの番です'));
  });
});

describe('スコアの更新', () => {
  async function assertTeamScore(team: 'A' | 'B', expectedScore: number) {
    const teamBox = await screen.findByTestId(team === 'A' ? 'team-a-box' : 'team-b-box');

    expect(teamBox).toHaveTextContent(`${expectedScore}点`);
  }

  async function assertState(expectedA: number, expectedB: number, expectedTurn?: string) {
    await assertTeamScore('A', expectedA);
    await assertTeamScore('B', expectedB);

    if (expectedTurn) {
      expect(await screen.findByText(expectedTurn)).toBeInTheDocument();
    }
  }

  async function assertTeamState(team: 'A' | 'B', expectedScore: number, expectedFoul: number) {
    const teamId = team === 'A' ? 'team-a-box' : 'team-b-box';
    const teamBox = await screen.findByTestId(teamId);

    expect(within(teamBox).getByText(`${expectedScore}点`)).toBeInTheDocument();

    if (expectedFoul > 0) {
      expect(within(teamBox).getByText(`ファウル：${expectedFoul}`)).toBeInTheDocument();
    } else {
      expect(within(teamBox).queryByText(/ファウル：/)).not.toBeInTheDocument();
    }
  }

  const user = userEvent.setup();

  async function playAndAssert(
    point: number,
    expectedA: number,
    expectedB: number,
    expectedTurn: string
  ) {
    const button = await screen.findByRole('button', { name: `${point}点` });
    await user.click(button);
    assertState(expectedA, expectedB, expectedTurn);
  }

  async function clickBackAndAssert(expectedA: number, expectedB: number, expectedTurn: string) {
    const button = await screen.findByRole('button', { name: '戻る' });
    await user.click(button);
    assertState(expectedA, expectedB);
  }

  test('チームAとチームBが交互に得点し、スコアと攻撃権が正しく遷移する', async () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);

    const steps = [
      { point: 12, a: 12, b: 0, nextTurn: '🟦チームBの番です' },
      { point: 11, a: 12, b: 11, nextTurn: '🟥チームAの番です' },
      { point: 10, a: 22, b: 11, nextTurn: '🟦チームBの番です' },
      { point: 9, a: 22, b: 20, nextTurn: '🟥チームAの番です' },
      { point: 8, a: 30, b: 20, nextTurn: '🟦チームBの番です' },
      { point: 7, a: 30, b: 27, nextTurn: '🟥チームAの番です' },
      { point: 6, a: 36, b: 27, nextTurn: '🟦チームBの番です' },
      { point: 5, a: 36, b: 32, nextTurn: '🟥チームAの番です' },
      { point: 4, a: 40, b: 32, nextTurn: '🟦チームBの番です' },
      { point: 3, a: 40, b: 35, nextTurn: '🟥チームAの番です' },
      { point: 2, a: 42, b: 35, nextTurn: '🟦チームBの番です' },
      { point: 1, a: 42, b: 36, nextTurn: '🟥チームAの番です' },
    ];

    for (const step of steps) {
      await playAndAssert(step.point, step.a, step.b, step.nextTurn);
    }
  });

  test('番手のチームの合計スコアにハイライトが当たり、そうでないチームにはつかない', async () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);
    let teamABox = await screen.findByTestId('team-a-box');
    let teamBBox = await screen.findByTestId('team-b-box');
    expect(teamABox).toHaveClass('bg-yellow-100 dark:bg-yellow-900/20');
    expect(teamBBox).not.toHaveClass('bg-yellow-100 dark:bg-yellow-900/20');

    await playAndAssert(5, 5, 0, '🟦チームBの番です');
    teamABox = await screen.findByTestId('team-a-box');
    teamBBox = await screen.findByTestId('team-b-box');
    expect(teamABox).not.toHaveClass('bg-yellow-100 dark:bg-yellow-900/20');
    expect(teamBBox).toHaveClass('bg-yellow-100 dark:bg-yellow-900/20');

    await clickBackAndAssert(5, 0, '🟦チームBの番です');
    teamABox = await screen.findByTestId('team-a-box');
    teamBBox = await screen.findByTestId('team-b-box');
    expect(teamABox).toHaveClass('bg-yellow-100 dark:bg-yellow-900/20');
    expect(teamBBox).not.toHaveClass('bg-yellow-100 dark:bg-yellow-900/20');
  });

  test('ファウルボタンを押すと、得点は加算されずに攻撃権が移り、合計スコアの下にファウル回数が表示される', async () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);

    const foulButton = await screen.findByRole('button', { name: 'ファウル' });

    await user.click(foulButton);

    expect(await screen.findByText('🟦チームBの番です')).toBeInTheDocument();
    await assertTeamState('A', 0, 1);
    await assertTeamState('B', 0, 0);
  });

  test('ファウル回数が表示されている状態で、得点をすると得点した側のファウル回数がリセットされる', async () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);

    const foulButton = await screen.findByRole('button', { name: 'ファウル' });
    await user.click(foulButton);

    await assertTeamState('A', 0, 1);

    assert.isOk(screen.getByText('🟦チームBの番です'), 'チームBの番が表示されていること');
    await user.click(foulButton);
    await assertTeamState('A', 0, 1);
    await assertTeamState('B', 0, 1);

    await playAndAssert(5, 0, 5, '🟥チームAの番です');
    await assertTeamState('A', 5, 0);
    await assertTeamState('B', 0, 1);
  });

  test('戻るボタンを押すと、前の状態に戻る', async () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);
    await playAndAssert(5, 5, 0, '🟦チームBの番です');
    await playAndAssert(3, 5, 3, '🟥チームAの番です');

    await clickBackAndAssert(5, 0, '🟦チームBの番です');
    await clickBackAndAssert(0, 0, '🟥チームAの番です');
  });
});
