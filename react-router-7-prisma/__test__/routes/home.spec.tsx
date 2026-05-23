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

test('2チームで遊ぶのボタンが見えて、ボタンを押すと2チーム用の画面に遷移する', async () => {
  render(<Stub initialEntries={['/']} />);

  const link = screen.getByRole('button', { name: '2チームで遊ぶ' });
  expect(link).toBeInTheDocument();
  await userEvent.click(link);
  expect(await screen.findByText('モルック・スコア計算(2チーム)')).toBeInTheDocument();
});

test('3チームで遊ぶのボタンが見えて、ボタンを押すと3チーム用の画面に遷移する', async () => {
  render(<Stub initialEntries={['/']} />);

  const link = screen.getByRole('button', { name: '3チームで遊ぶ' });
  expect(link).toBeInTheDocument();
  await userEvent.click(link);
  expect(await screen.findByText('モルック・スコア計算(3チーム)')).toBeInTheDocument();
});

test('メンバーを登録して遊ぶボタンが見え、ボタンを押すとメンバー登録画面に遷移する', async () => {
  render(<Stub initialEntries={['/']} />);

  const link = screen.getByRole('button', { name: '👥 メンバーを登録して遊ぶ' });
  expect(link).toBeInTheDocument();
  await userEvent.click(link);
  expect(await screen.findByText('メンバー登録')).toBeInTheDocument();
});
