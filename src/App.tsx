import { Provider } from 'react-redux';
import { store } from './store/store';
import { Toaster } from 'react-hot-toast';
import { AuthInitializer } from './components/AuthInitializer';
import { ReactNode } from 'react';

interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <Toaster position="top-right" />
      {children}
    </Provider>
  );
}

export default App;