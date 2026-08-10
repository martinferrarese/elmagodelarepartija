import { CssBaseline, ThemeProvider } from '@mui/material';
import ListaIntegrantes from './ListaIntegrantes';
import './App.css';
import { magoTheme } from './theme';

function App() {
  return (
    <ThemeProvider theme={magoTheme}>
      <CssBaseline />
      <div className='App-shell'>
        <header className='App-brand'>
          <img
            className='App-brand__logo'
            src={`${process.env.PUBLIC_URL}/sombrero.png`}
            alt='Sombrero del mago'
          />
          <h1 className='App-brand__title'>El mago de la repartija</h1>
          <p className='App-brand__tagline'>cuentas claras, no magia…</p>
        </header>
        <ListaIntegrantes />
      </div>
    </ThemeProvider>
  );
}

export default App;
