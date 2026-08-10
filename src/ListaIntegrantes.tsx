import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  calcularTransferencias,
  juntadaEsValida,
  puedeAgregarAlRoster,
  rosterPuedeAvanzar,
  subgrupoEsValido,
} from './repartija/calcular';
import { SubgrupoJuntada, Transferencia } from './repartija/types';

type Paso = 'roster' | 'subgrupos' | 'resultado';

const botonMorado = { backgroundColor: 'purple' };

function siguienteId(subgrupos: SubgrupoJuntada[]): number {
  if (subgrupos.length === 0) return 1;
  return Math.max(...subgrupos.map((s) => s.id)) + 1;
}

function ListaIntegrantes() {
  const [paso, setPaso] = useState<Paso>('roster');
  const [roster, setRoster] = useState<string[]>([]);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [subgrupos, setSubgrupos] = useState<SubgrupoJuntada[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [error, setError] = useState('');

  const agregarNombre = () => {
    if (!puedeAgregarAlRoster(roster, nombreNuevo)) {
      setError('Nombre vacío o duplicado');
      return;
    }
    setRoster((prev) => [...prev, nombreNuevo.trim()]);
    setNombreNuevo('');
    setError('');
  };

  const quitarNombre = (nombre: string) => {
    setRoster((prev) => prev.filter((n) => n !== nombre));
    setSubgrupos((prev) =>
      prev.map((sg) => ({
        ...sg,
        miembros: sg.miembros.filter((m) => m.nombre !== nombre),
      })),
    );
  };

  const crearSubgrupo = () => {
    setSubgrupos((prev) => {
      const id = siguienteId(prev);
      return [...prev, { id, nombre: `Grupo ${id}`, miembros: [] }];
    });
  };

  const borrarSubgrupo = (id: number) => {
    setSubgrupos((prev) => prev.filter((sg) => sg.id !== id));
  };

  const toggleMiembro = (id: number, nombre: string) => {
    setSubgrupos((prev) =>
      prev.map((sg) => {
        if (sg.id !== id) return sg;
        const existe = sg.miembros.some((m) => m.nombre === nombre);
        if (existe) {
          return { ...sg, miembros: sg.miembros.filter((m) => m.nombre !== nombre) };
        }
        return { ...sg, miembros: [...sg.miembros, { nombre, monto: 0 }] };
      }),
    );
  };

  const agregarTodos = (id: number) => {
    setSubgrupos((prev) =>
      prev.map((sg) => {
        if (sg.id !== id) return sg;
        const miembros = roster.map((nombre) => {
          const actual = sg.miembros.find((m) => m.nombre === nombre);
          return actual ?? { nombre, monto: 0 };
        });
        return { ...sg, miembros };
      }),
    );
  };

  const setMonto = (id: number, nombre: string, montoRaw: string) => {
    const monto = montoRaw === '' ? 0 : parseInt(montoRaw, 10);
    if (Number.isNaN(monto) || monto < 0) return;
    setSubgrupos((prev) =>
      prev.map((sg) => {
        if (sg.id !== id) return sg;
        return {
          ...sg,
          miembros: sg.miembros.map((m) => (m.nombre === nombre ? { ...m, monto } : m)),
        };
      }),
    );
  };

  const calcular = () => {
    const juntada = { roster, subgrupos };
    if (!juntadaEsValida(juntada)) {
      setError('Revisá que haya al menos un grupo válido (≥2 personas, montos ≥ 0)');
      return;
    }
    setError('');
    setTransferencias(calcularTransferencias(juntada));
    setPaso('resultado');
  };

  return (
    <Container maxWidth='sm'>
      <Typography variant='subtitle1' mb={2}>
        {paso === 'roster' && 'Paso 1: integrantes'}
        {paso === 'subgrupos' && 'Paso 2: subgrupos y montos'}
        {paso === 'resultado' && 'Paso 3: transferencias'}
      </Typography>

      {error && (
        <Typography color='error' mb={2}>
          {error}
        </Typography>
      )}

      {paso === 'roster' && (
        <>
          <Grid container spacing={1} mb={2}>
            {roster.map((nombre) => (
              <Grid item xs={12} key={nombre}>
                <span style={{ marginRight: 10 }}>{nombre}</span>
                <Button size='small' onClick={() => quitarNombre(nombre)}>
                  Quitar
                </Button>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={8}>
              <TextField
                label='Nombre'
                variant='filled'
                size='small'
                fullWidth
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button variant='contained' style={botonMorado} onClick={agregarNombre}>
                Agregar
              </Button>
            </Grid>
          </Grid>
          <Button
            sx={{ mt: 2 }}
            variant='contained'
            style={botonMorado}
            disabled={!rosterPuedeAvanzar(roster)}
            onClick={() => {
              setError('');
              if (subgrupos.length === 0) crearSubgrupo();
              setPaso('subgrupos');
            }}
          >
            Seguir
          </Button>
        </>
      )}

      {paso === 'subgrupos' && (
        <>
          <Button sx={{ mb: 2, mr: 1 }} onClick={() => setPaso('roster')}>
            Volver a integrantes
          </Button>
          <Button sx={{ mb: 2 }} variant='outlined' onClick={crearSubgrupo}>
            Agregar grupo
          </Button>

          {subgrupos.map((sg) => (
            <div key={sg.id} style={{ marginBottom: '1.5rem', borderTop: '1px solid #ddd', paddingTop: 8 }}>
              <Typography variant='h6'>{sg.nombre}</Typography>
              <Button size='small' onClick={() => agregarTodos(sg.id)}>
                Todos
              </Button>
              <Button size='small' color='error' onClick={() => borrarSubgrupo(sg.id)}>
                Borrar grupo
              </Button>
              <FormGroup>
                {roster.map((nombre) => {
                  const miembro = sg.miembros.find((m) => m.nombre === nombre);
                  const checked = Boolean(miembro);
                  return (
                    <Grid container key={nombre} alignItems='center' spacing={1}>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={() => toggleMiembro(sg.id, nombre)}
                            />
                          }
                          label={nombre}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        {checked && (
                          <TextField
                            label='Monto'
                            type='number'
                            size='small'
                            variant='filled'
                            value={miembro?.monto ?? 0}
                            inputProps={{ min: 0, step: 1 }}
                            onChange={(e) => setMonto(sg.id, nombre, e.target.value)}
                          />
                        )}
                      </Grid>
                    </Grid>
                  );
                })}
              </FormGroup>
              {!subgrupoEsValido(sg) && (
                <Typography variant='caption' color='error'>
                  El grupo necesita al menos 2 personas y montos enteros ≥ 0
                </Typography>
              )}
            </div>
          ))}

          <Button variant='contained' style={botonMorado} onClick={calcular}>
            Calcular transferencias
          </Button>
        </>
      )}

      {paso === 'resultado' && (
        <>
          <Button sx={{ mb: 2 }} onClick={() => setPaso('subgrupos')}>
            Volver a editar
          </Button>
          {transferencias.length === 0 ? (
            <Typography>No hace falta transferir nada.</Typography>
          ) : (
            <Grid container spacing={1}>
              {transferencias.map((t) => (
                <Grid item xs={12} key={`${t.de}-${t.a}-${t.monto}`}>
                  <Typography>
                    {t.de} le transfiere ${t.monto} a {t.a}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}

export default ListaIntegrantes;
