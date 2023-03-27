import { Button, Container, Grid, TextField } from '@mui/material';
import { useState } from 'react';
import './App.css';
import { Deudor, IntegranteDelGrupo } from './Interfaces';
import { calcular } from './Logica';

function ListaIntegrantes() {
  const [lista, setLista] = useState<IntegranteDelGrupo[]>([]);
  const [nombre, setNombre] = useState('');
  const [plataQuePuso, setPlataQuePuso] = useState(0);
  const [deudores, setDeudores] = useState<Deudor[]>([]);

  const agregarIntegrante = () => {
    setLista((listaAnterior) => [...listaAnterior, { nombre, plataQuePuso, divideEntre: [] }]);
    setNombre('');
    setPlataQuePuso(0);
  };

  const calcularLaRepartija = () => {
    setDeudores(calcular(lista));
  };

  return (
    <Container maxWidth='sm'>
      <Grid container spacing={1}>
        {lista.map((integrante, i) => (
          <Grid item xs={12} key={i}>
            <span style={{ marginRight: 10 }}>{integrante.nombre}</span>
            <span>{integrante.plataQuePuso}</span>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} mt={1}>
        <Grid item xs={4}>
          <TextField
            id='filled-basic'
            label='Nombre'
            variant='filled'
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            size='small'
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            id='filled-basic'
            label='Cuánto puso'
            variant='filled'
            type='number'
            value={plataQuePuso}
            onChange={(event) => setPlataQuePuso(parseInt(event.target.value, 10))}
            size='small'
          />
        </Grid>
        <Grid item xs={4}>
          <Button
            variant='contained'
            style={{ backgroundColor: 'purple' }}
            onClick={() => agregarIntegrante()}
          >
            Agregar
          </Button>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} mt={2} mb={2}>
          <Button
            style={{ backgroundColor: 'purple' }}
            onClick={() => calcularLaRepartija()}
            variant='contained'
          >
            Hacer la repartija
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        {deudores.map((deudor, i) => (
          <Grid item xs={12} key={i}>
            {deudor.aQuienesLeDebe.map((acreedor, x) => (
              <div
                key={x}
              >{`${deudor.nombre} le debe a ${acreedor.nombre} $${acreedor.cuantoTieneQueCobrar}`}</div>
            ))}
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ListaIntegrantes;
