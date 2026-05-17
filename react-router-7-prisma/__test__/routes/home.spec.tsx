import { render, screen, waitFor, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import Home from '../../app/routes/home';
import { createRoutesStub } from 'react-router';
import CalculationMolkky from '~/routes/CalculationMolkky';
import CalculationMolkkyThreeTeam from '~/routes/CalculationMolkkyThreeTeam';
import userEvent from '@testing-library/user-event';

const Stub = createRoutesStub([
  {
    path: '/',
    Component: Home,
  },
]);

test('「モルック・スコア計算」のタイトルが見える', () => {
  render(<Stub initialEntries={['/']} />);

  expect(screen.getByText('モルック・スコア計算'));
});

test('2チームで遊ぶのリンクが見えて、リンクを押すと2チーム用の画面に遷移する', async () => {
  render(<Stub initialEntries={['/']} />);

  const link = screen.getByRole('button', { name: '2チームで遊ぶ' });
  expect(link).toBeInTheDocument();
  await userEvent.click(link);
  expect(await screen.findByText('モルック・スコア計算(2チーム)')).toBeInTheDocument();
});

test('3チームで遊ぶのリンクが見えて、リンクを押すと3チーム用の画面に遷移する', async () => {
  render(<Stub initialEntries={['/']} />);

  const link = screen.getByRole('button', { name: '3チームで遊ぶ' });
  expect(link).toBeInTheDocument();
  await userEvent.click(link);
  expect(await screen.findByText('モルック・スコア計算(3チーム)')).toBeInTheDocument();
});
