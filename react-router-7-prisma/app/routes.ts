import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('two_team', 'routes/CalculationMolkky.tsx'),
] satisfies RouteConfig;
