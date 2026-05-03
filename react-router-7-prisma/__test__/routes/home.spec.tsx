import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Home from '../../app/routes/home';
import { createRoutesStub } from 'react-router';
import { CalculationMolkky } from '~/routes/CalculationMolkky';

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

test('「モルック・スコア計算」のタイトルが見える', () => {
  render(<Stub initialEntries={['/calculation_molkky']} />);

  expect(screen.getByText('モルック・スコア計算'));
});

test('2チームの合計得点が見える', () => {
  render(<Stub initialEntries={['/calculation_molkky']} />);
  expect(screen.getByText('チームA：0点'));
  expect(screen.getByText('チームB：0点'));
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
