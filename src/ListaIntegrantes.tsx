import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  calcularDesglose,
  calcularTransferencias,
  juntadaEsValida,
  puedeAgregarAlRoster,
  rosterPuedeAvanzar,
  subgrupoEsValido,
} from './repartija/calcular';
import {
  acreedoresDeTransferencias,
  formatearResultadoParaCopiar,
} from './repartija/formatearResultado';
import { DesgloseSubgrupo, SubgrupoJuntada, Transferencia } from './repartija/types';

type Paso = 'roster' | 'subgrupos' | 'resultado';

const pasos: { id: Paso; label: string }[] = [
  { id: 'roster', label: '1 · Integrantes' },
  { id: 'subgrupos', label: '2 · Subgrupos' },
  { id: 'resultado', label: '3 · Resultado' },
];

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
  const [desglose, setDesglose] = useState<DesgloseSubgrupo[]>([]);
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const [copyFeedback, setCopyFeedback] = useState<'ok' | 'error' | ''>('');
  const [error, setError] = useState('');

  const acreedores = acreedoresDeTransferencias(transferencias);

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
    if (montoRaw.trim() === '') {
      setSubgrupos((prev) =>
        prev.map((sg) => {
          if (sg.id !== id) return sg;
          return {
            ...sg,
            miembros: sg.miembros.map((m) => (m.nombre === nombre ? { ...m, monto: 0 } : m)),
          };
        }),
      );
      return;
    }
    const monto = parseInt(montoRaw, 10);
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

  const setNombreSubgrupo = (id: number, nombreRaw: string) => {
    setSubgrupos((prev) =>
      prev.map((sg) => (sg.id === id ? { ...sg, nombre: nombreRaw } : sg)),
    );
  };

  const confirmarNombreSubgrupo = (id: number) => {
    setSubgrupos((prev) =>
      prev.map((sg) => {
        if (sg.id !== id) return sg;
        const limpio = sg.nombre.trim();
        return { ...sg, nombre: limpio.length > 0 ? limpio : `Grupo ${id}` };
      }),
    );
  };

  const setAlias = (nombre: string, valor: string) => {
    setAliases((prev) => ({ ...prev, [nombre]: valor }));
  };

  const copiarResultado = async () => {
    const texto = formatearResultadoParaCopiar(transferencias, aliases);
    try {
      await navigator.clipboard.writeText(texto);
      setCopyFeedback('ok');
    } catch {
      setCopyFeedback('error');
    }
  };

  const calcular = () => {
    const juntada = { roster, subgrupos };
    if (!juntadaEsValida(juntada)) {
      setError('Revisá que haya al menos un grupo válido (≥2 personas, montos ≥ 0)');
      return;
    }
    setError('');
    setCopyFeedback('');
    setTransferencias(calcularTransferencias(juntada));
    setDesglose(calcularDesglose(juntada));
    setPaso('resultado');
  };

  return (
    <Container maxWidth='sm' disableGutters>
      <div className='App-panel'>
        <nav className='step-indicator' aria-label='Pasos'>
          {pasos.map((p) => (
            <span
              key={p.id}
              className={`step-indicator__item${paso === p.id ? ' step-indicator__item--active' : ''}`}
            >
              {p.label}
            </span>
          ))}
        </nav>

        {error && (
          <Typography color='error' mb={2}>
            {error}
          </Typography>
        )}

        {paso === 'roster' && (
          <Stack spacing={2}>
            <Typography variant='h6' textAlign='center' width='100%'>
              ¿Quiénes están en la juntada?
            </Typography>
            <Box>
              {roster.map((nombre) => (
                <div className='roster-chip' key={nombre}>
                  <Typography fontWeight={600}>{nombre}</Typography>
                  <Button size='small' onClick={() => quitarNombre(nombre)}>
                    Quitar
                  </Button>
                </div>
              ))}
            </Box>
            <Stack spacing={1.5} sx={{ width: '100%' }}>
              <TextField
                label='Nombre'
                size='small'
                fullWidth
                variant='outlined'
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') agregarNombre();
                }}
                sx={{ width: '100%', m: 0 }}
              />
              <Button variant='contained' fullWidth onClick={agregarNombre}>
                Agregar
              </Button>
            </Stack>
            <Button
              variant='contained'
              fullWidth
              disabled={!rosterPuedeAvanzar(roster)}
              onClick={() => {
                setError('');
                if (subgrupos.length === 0) crearSubgrupo();
                setPaso('subgrupos');
              }}
            >
              Seguir
            </Button>
          </Stack>
        )}

        {paso === 'subgrupos' && (
          <Stack spacing={2}>
            <Typography variant='h6'>Subgrupos y montos</Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              <Button variant='outlined' onClick={() => setPaso('roster')}>
                Volver
              </Button>
              <Button variant='contained' color='secondary' onClick={crearSubgrupo}>
                Agregar grupo
              </Button>
            </Stack>

            {subgrupos.map((sg) => (
              <div className='subgroup-block' key={sg.id}>
                <TextField
                  label='Nombre del grupo'
                  size='small'
                  fullWidth
                  variant='outlined'
                  value={sg.nombre}
                  onChange={(e) => setNombreSubgrupo(sg.id, e.target.value)}
                  onBlur={() => confirmarNombreSubgrupo(sg.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  sx={{ mb: 1 }}
                />
                <div className='subgroup-block__actions'>
                  <Button size='small' variant='contained' onClick={() => agregarTodos(sg.id)}>
                    Todos
                  </Button>
                  <Button size='small' color='error' onClick={() => borrarSubgrupo(sg.id)}>
                    Borrar grupo
                  </Button>
                </div>
                <FormGroup>
                  {roster.map((nombre) => {
                    const miembro = sg.miembros.find((m) => m.nombre === nombre);
                    const checked = Boolean(miembro);
                    return (
                      <div className='member-row' key={nombre}>
                        <FormControlLabel
                          className='member-row__check'
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={() => toggleMiembro(sg.id, nombre)}
                            />
                          }
                          label={nombre}
                        />
                        {checked && (
                          <TextField
                            className='member-row__monto'
                            label='Monto'
                            type='number'
                            size='small'
                            value={miembro && miembro.monto === 0 ? '' : miembro?.monto ?? ''}
                            placeholder='0'
                            inputProps={{ min: 0, step: 1, inputMode: 'numeric' }}
                            onFocus={(e) => {
                              if (miembro?.monto === 0) {
                                e.target.select();
                              }
                            }}
                            onChange={(e) => setMonto(sg.id, nombre, e.target.value)}
                          />
                        )}
                      </div>
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

            <Button variant='contained' onClick={calcular}>
              Calcular transferencias
            </Button>
          </Stack>
        )}

        {paso === 'resultado' && (
          <Stack spacing={2}>
            <Typography variant='h6'>Transferencias</Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              <Button variant='outlined' onClick={() => setPaso('subgrupos')}>
                Volver a editar
              </Button>
              <Button variant='contained' color='secondary' onClick={copiarResultado}>
                Copiar resultado
              </Button>
            </Stack>
            {copyFeedback === 'ok' && (
              <Typography variant='body2' color='success.main'>
                Copiado
              </Typography>
            )}
            {copyFeedback === 'error' && (
              <Typography variant='body2' color='error'>
                No se pudo copiar. Probá de nuevo o copiá a mano.
              </Typography>
            )}
            {transferencias.length === 0 ? (
              <Typography>No hace falta transferir nada.</Typography>
            ) : (
              <Stack spacing={1}>
                {transferencias.map((t) => (
                  <Typography key={`${t.de}-${t.a}-${t.monto}`} fontWeight={600}>
                    {t.de} le transfiere ${t.monto} a {t.a}
                  </Typography>
                ))}
              </Stack>
            )}

            {acreedores.length > 0 && (
              <Stack spacing={1.5}>
                <Typography variant='subtitle1' fontWeight={600}>
                  Alias de cobro
                </Typography>
                {acreedores.map((nombre) => (
                  <TextField
                    key={nombre}
                    label={`Alias de ${nombre}`}
                    size='small'
                    fullWidth
                    variant='outlined'
                    value={aliases[nombre] ?? ''}
                    onChange={(e) => setAlias(nombre, e.target.value)}
                    placeholder='Opcional (ej. manita.mp)'
                  />
                ))}
              </Stack>
            )}

            <Accordion defaultExpanded={false}>
              <AccordionSummary>
                <Typography fontWeight={600}>Desglose por grupo</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='caption' display='block' mb={2}>
                  Saldo por grupo (antes del ajuste global de redondeo)
                </Typography>
                {desglose.map((sg) => (
                  <Box key={sg.id} mb={2}>
                    <Typography variant='subtitle2'>{sg.nombre}</Typography>
                    <Typography variant='body2'>
                      Total ${sg.total} · {sg.cantidadMiembros} personas · cuota ${sg.cuota}
                    </Typography>
                    {sg.lineas.map((linea) => (
                      <Typography key={linea.nombre} variant='body2'>
                        {linea.nombre}: puso ${linea.puso}, cuota ${linea.cuota}, saldo{' '}
                        {linea.saldo >= 0 ? '+' : ''}
                        {linea.saldo}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </Stack>
        )}
      </div>
    </Container>
  );
}

export default ListaIntegrantes;
