// import Button from "@mui/material/Button";
import ListaIntegrantes from './ListaIntegrantes';
import './App.css';

function App() {
  const estilos = {
    contenedor: {
      height: '100%',
      left: '0px',
      width: '100%',
      overflow: 'hidden',
      paddingLeft: '1em',
    },
    titulo: {
      color: 'black',
    },
    contenedorTitulo: {
      display: 'flex',
      justifyContent: 'center',
    },
  };

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.contenedorTitulo}>
        <h1 style={estilos.titulo}>El mago de la repartija</h1>
      </div>
      <ListaIntegrantes />
    </div>
  );
}

export default App;
