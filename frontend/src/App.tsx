import { AppProviders } from '@/app/AppProviders';
import { AppRouter } from '@/router/AppRouter';

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
