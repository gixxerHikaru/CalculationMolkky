import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Home from '../../app/routes/home';
import { createRoutesStub } from 'react-router';
import { CalculationMolkky } from '~/routes/CalculationMolkky';

test('「モルック・スコア計算」のタイトルが見える', () => {
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
  render(<Stub initialEntries={['/calculation_molkky']} />);
  console.log(screen);

  expect(screen.getByText('モルック・スコア計算'));
});
