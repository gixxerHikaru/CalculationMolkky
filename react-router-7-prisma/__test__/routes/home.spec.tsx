import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Home from '../../app/routes/home';
import { createRoutesStub } from 'react-router';
import { CalculationMolkky } from '~/routes/CalculationMolkky';
import { describe } from 'vitest';

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
    expect(screen.getByText('🟥チームA：0点'));
    expect(screen.getByText('🟦チームB：0点'));
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
  async function playAndAssert(
    point: number,
    expectedA: number,
    expectedB: number,
    expectedTurn: string
  ) {
    const button = screen.getByRole('button', { name: `${point}点` });
    button.click();
    expect(await screen.findByText(`🟥チームA：${expectedA}点`)).toBeInTheDocument();
    expect(await screen.findByText(`🟦チームB：${expectedB}点`)).toBeInTheDocument();
    expect(await screen.findByText(expectedTurn)).toBeInTheDocument();
  }

  async function clickBackAndAssert(expectedA: number, expectedB: number, expectedTurn: string) {
    const button = screen.getByRole('button', { name: '戻る' });
    button.click();
    expect(
      await screen.findByText(t => t.includes(`🟥チームA：${expectedA}点`))
    ).toBeInTheDocument();
    expect(
      await screen.findByText(t => t.includes(`🟦チームB：${expectedB}点`))
    ).toBeInTheDocument();
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

  test('戻るボタンを押すと、前の状態に戻る', async () => {
    render(<Stub initialEntries={['/calculation_molkky']} />);
    await playAndAssert(5, 5, 0, '🟦チームBの番です');
    await playAndAssert(3, 5, 3, '🟥チームAの番です');

    await clickBackAndAssert(5, 0, '🟦チームBの番です');
    await clickBackAndAssert(0, 0, '🟥チームAの番です');
  });
});
