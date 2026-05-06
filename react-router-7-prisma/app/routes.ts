import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('two_team', 'routes/CalculationMolkky.tsx'),
  route('three_team', 'routes/CalculationMolkkyThreeTeam.tsx'),
] satisfies RouteConfig;
