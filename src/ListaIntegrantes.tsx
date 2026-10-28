import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  calcularDesglose,
  calcularTransferencias,
  puedeAgregarAlRoster,
} from './repartija/calcular';
import { armarUrlCompartida, leerJuntadaDeSearch } from './repartija/compartir';
import {
  acreedoresDeTransferencias,
  formatearResultadoParaCopiar,
} from './repartija/formatearResultado';
import { DesgloseSubgrupo, Juntada, Transferencia } from './repartija/types';

type Paso = 'lista' | 'cuentas' | 'resultado';
type Origen = 'lista' | 'cuentas';

type CuentaEditor = {
  id: number;
  nombre: string;
  nombreInicial: string;
  incluido: Record<string, boolean>;
  montos: Record<string, number>;
};

type EstadoInicial = {
  paso: Paso;
  origen: Origen;
  roster: string[];
  montos: Record<string, number>;
  aliases: Record<string, string>;
  cuentas: CuentaEditor[];
  juntadaCalculada: Juntada | null;
  transferencias: Transferencia[];
  desglose: DesgloseSubgrupo[];
};

function textoMonto(monto: number): string {
  return monto === 0 ? '' : String(monto);
}

function montoSiValido(valor: string): number | null {
  if (valor === '') return 0;
  if (!/^\d+$/.test(valor)) return null;
  return Number(valor);
}

function renombrarClave<T>(
  registro: Record<string, T>,
  anterior: string,
  nuevo: string,
): Record<string, T> {
  if (anterior === nuevo || !(anterior in registro)) return registro;
  const siguiente = { ...registro };
  siguiente[nuevo] = siguiente[anterior];
  delete siguiente[anterior];
  return siguiente;
}

function nombreVisibleCuenta(cuenta: CuentaEditor): string {
  return cuenta.nombre.trim() || cuenta.nombreInicial;
}

function textoSaldo(saldo: number): string {
  return `${saldo >= 0 ? '+' : ''}${saldo}`;
}

function leerEstadoInicial(): EstadoInicial {
  const compartido = leerJuntadaDeSearch(window.location.search);
  if (!compartido) {
    return {
      paso: 'lista',
      origen: 'lista',
      roster: [],
      montos: {},
      aliases: {},
      cuentas: [],
      juntadaCalculada: null,
      transferencias: [],
      desglose: [],
    };
  }

  const { origen, juntada, aliases } = compartido;
  const primera = juntada.subgrupos[0];
  const mapaPrimera = new Map(primera.miembros.map((m) => [m.nombre, m.monto]));
  const montos = Object.fromEntries(
    juntada.roster.map((nombre) => [nombre, mapaPrimera.get(nombre) ?? 0]),
  );

  const cuentas: CuentaEditor[] =
    origen === 'cuentas'
      ? juntada.subgrupos.map((subgrupo) => {
          const mapaSubgrupo = new Map(subgrupo.miembros.map((m) => [m.nombre, m.monto]));
          return {
            id: subgrupo.id,
            nombre: subgrupo.nombre,
            nombreInicial: subgrupo.id === 1 ? 'Cuenta' : `Cuenta ${subgrupo.id}`,
            incluido: Object.fromEntries(
              juntada.roster.map((nombre) => [nombre, mapaSubgrupo.has(nombre)]),
            ),
            montos: Object.fromEntries(
              juntada.roster.map((nombre) => [nombre, mapaSubgrupo.get(nombre) ?? 0]),
            ),
          };
        })
      : [];

  return {
    paso: 'resultado',
    origen,
    roster: juntada.roster,
    montos,
    aliases,
    cuentas,
    juntadaCalculada: juntada,
    transferencias: calcularTransferencias(juntada),
    desglose: calcularDesglose(juntada),
  };
}

function ListaIntegrantes() {
  const [inicial] = useState<EstadoInicial>(leerEstadoInicial);
  const [paso, setPaso] = useState<Paso>(inicial.paso);
  const [origen, setOrigen] = useState<Origen>(inicial.origen);
  const [roster, setRoster] = useState<string[]>(inicial.roster);
  const [montos, setMontos] = useState<Record<string, number>>(inicial.montos);
  const [aliases, setAliases] = useState<Record<string, string>>(inicial.aliases);
  const [borradores, setBorradores] = useState<Record<string, string>>({});
  const [cuentas, setCuentas] = useState<CuentaEditor[]>(inicial.cuentas);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [error, setError] = useState('');
  const [confirmandoVuelta, setConfirmandoVuelta] = useState(false);
  const [juntadaCalculada, setJuntadaCalculada] = useState<Juntada | null>(
    inicial.juntadaCalculada,
  );
  const [transferencias, setTransferencias] = useState<Transferencia[]>(inicial.transferencias);
  const [desglose, setDesglose] = useState<DesgloseSubgrupo[]>(inicial.desglose);
  const [avisoCopia, setAvisoCopia] = useState('');

  const agregarNombre = () => {
    const limpio = nombreNuevo.trim();
    if (!puedeAgregarAlRoster(roster, nombreNuevo)) {
      setError('Nombre vacío o duplicado.');
      return;
    }
    setRoster((prev) => [...prev, limpio]);
    setMontos((prev) => ({ ...prev, [limpio]: 0 }));
    setCuentas((prev) =>
      prev.map((cuenta, indice) => ({
        ...cuenta,
        incluido: { ...cuenta.incluido, [limpio]: indice === 0 },
        montos: { ...cuenta.montos, [limpio]: 0 },
      })),
    );
    setNombreNuevo('');
    setError('');
  };

  const quitarNombre = (nombre: string) => {
    setRoster((prev) => prev.filter((n) => n !== nombre));
    setMontos((prev) => {
      const siguiente = { ...prev };
      delete siguiente[nombre];
      return siguiente;
    });
    setAliases((prev) => {
      const siguiente = { ...prev };
      delete siguiente[nombre];
      return siguiente;
    });
    setBorradores((prev) => {
      const siguiente = { ...prev };
      delete siguiente[nombre];
      return siguiente;
    });
    setCuentas((prev) =>
      prev.map((cuenta) => {
        const incluido = { ...cuenta.incluido };
        const montosCuenta = { ...cuenta.montos };
        delete incluido[nombre];
        delete montosCuenta[nombre];
        return { ...cuenta, incluido, montos: montosCuenta };
      }),
    );
  };

  const confirmarNombre = (anterior: string) => {
    const limpio = (borradores[anterior] ?? anterior).trim();
    const duplicado = roster.some((nombre) => nombre !== anterior && nombre === limpio);
    if (!limpio || duplicado) {
      setBorradores((prev) => ({ ...prev, [anterior]: anterior }));
      setError('Nombre vacío o duplicado.');
      return;
    }
    if (limpio === anterior) {
      setBorradores((prev) => ({ ...prev, [anterior]: limpio }));
      return;
    }
    setRoster((prev) => prev.map((nombre) => (nombre === anterior ? limpio : nombre)));
    setMontos((prev) => renombrarClave(prev, anterior, limpio));
    setAliases((prev) => renombrarClave(prev, anterior, limpio));
    setBorradores((prev) => ({ ...renombrarClave(prev, anterior, limpio), [limpio]: limpio }));
    setCuentas((prev) =>
      prev.map((cuenta) => ({
        ...cuenta,
        incluido: renombrarClave(cuenta.incluido, anterior, limpio),
        montos: renombrarClave(cuenta.montos, anterior, limpio),
      })),
    );
    setError('');
  };

  const abrirCuentas = () => {
    const primera: CuentaEditor = {
      id: 1,
      nombre: 'Cuenta',
      nombreInicial: 'Cuenta',
      incluido: Object.fromEntries(roster.map((nombre) => [nombre, true])),
      montos: Object.fromEntries(roster.map((nombre) => [nombre, montos[nombre] ?? 0])),
    };
    setCuentas([primera]);
    setError('');
    setPaso('cuentas');
  };

  const actualizarNombreCuenta = (id: number, nombre: string) => {
    setCuentas((prev) => prev.map((cuenta) => (cuenta.id === id ? { ...cuenta, nombre } : cuenta)));
  };

  const confirmarNombreCuenta = (id: number) => {
    setCuentas((prev) =>
      prev.map((cuenta) => {
        if (cuenta.id !== id) return cuenta;
        const limpio = cuenta.nombre.trim();
        return { ...cuenta, nombre: limpio || cuenta.nombreInicial };
      }),
    );
  };

  const agregarCuenta = () => {
    const siguienteId = cuentas.reduce((max, cuenta) => Math.max(max, cuenta.id), 0) + 1;
    const nueva: CuentaEditor = {
      id: siguienteId,
      nombre: `Cuenta ${siguienteId}`,
      nombreInicial: `Cuenta ${siguienteId}`,
      incluido: Object.fromEntries(roster.map((nombre) => [nombre, false])),
      montos: Object.fromEntries(roster.map((nombre) => [nombre, 0])),
    };
    setCuentas((prev) => [...prev, nueva]);
  };

  const borrarCuenta = (id: number) => {
    const siguientes = cuentas.filter((cuenta) => cuenta.id !== id);
    setCuentas(siguientes);
    setError('');
    if (siguientes.length < 2) setConfirmandoVuelta(false);
  };

  const volverConCuenta = (cuenta: CuentaEditor) => {
    setMontos(
      Object.fromEntries(
        roster.map((nombre) => [nombre, cuenta.incluido[nombre] ? cuenta.montos[nombre] ?? 0 : 0]),
      ),
    );
    setCuentas([]);
    setConfirmandoVuelta(false);
    setError('');
    setPaso('lista');
  };

  const pedirVolverAUnaCuenta = () => {
    if (cuentas.length <= 1) {
      if (cuentas[0]) volverConCuenta(cuentas[0]);
      return;
    }
    setConfirmandoVuelta(true);
  };

  const actualizarIncluido = (id: number, persona: string, incluido: boolean) => {
    setError('');
    setCuentas((prev) =>
      prev.map((cuenta) =>
        cuenta.id === id
          ? { ...cuenta, incluido: { ...cuenta.incluido, [persona]: incluido } }
          : cuenta,
      ),
    );
  };

  const actualizarMontoCuenta = (id: number, persona: string, valor: string) => {
    const monto = montoSiValido(valor);
    if (monto === null) return;
    setCuentas((prev) =>
      prev.map((cuenta) =>
        cuenta.id === id ? { ...cuenta, montos: { ...cuenta.montos, [persona]: monto } } : cuenta,
      ),
    );
  };

  const actualizarMonto = (nombre: string, valor: string) => {
    const monto = montoSiValido(valor);
    if (monto === null) return;
    setMontos((prev) => ({ ...prev, [nombre]: monto }));
  };

  const publicarResultado = (juntada: Juntada, siguienteOrigen: Origen) => {
    setJuntadaCalculada(juntada);
    setTransferencias(calcularTransferencias(juntada));
    setDesglose(calcularDesglose(juntada));
    setOrigen(siguienteOrigen);
    setAvisoCopia('');
    setError('');
    setConfirmandoVuelta(false);
    setPaso('resultado');
  };

  const calcular = () => {
    if (roster.length < 2) {
      setError('Hacen falta dos nombres para calcular.');
      return;
    }

    publicarResultado(
      {
        roster,
        subgrupos: [
          {
            id: 1,
            nombre: 'Cuenta',
            miembros: roster.map((nombre) => ({ nombre, monto: montos[nombre] ?? 0 })),
          },
        ],
      },
      'lista',
    );
  };

  const calcularDesdeCuentas = () => {
    const invalida = cuentas.find(
      (cuenta) => roster.filter((nombre) => cuenta.incluido[nombre]).length < 2,
    );
    if (invalida) {
      setError(`${nombreVisibleCuenta(invalida)} necesita al menos dos personas.`);
      return;
    }

    publicarResultado(
      {
        roster,
        subgrupos: cuentas.map((cuenta) => ({
          id: cuenta.id,
          nombre: cuenta.nombre.trim() || cuenta.nombreInicial,
          miembros: roster
            .filter((nombre) => cuenta.incluido[nombre])
            .map((nombre) => ({ nombre, monto: cuenta.montos[nombre] ?? 0 })),
        })),
      },
      'cuentas',
    );
  };

  const copiarResultado = async () => {
    try {
      await navigator.clipboard.writeText(formatearResultadoParaCopiar(transferencias, aliases));
      setAvisoCopia('Copiado');
    } catch {
      setAvisoCopia('No se pudo copiar. Probá de nuevo o copiá a mano.');
    }
  };

  const copiarLink = async () => {
    if (!juntadaCalculada) return;
    try {
      const link = armarUrlCompartida(window.location.href, {
        origen,
        juntada: juntadaCalculada,
        aliases,
      });
      await navigator.clipboard.writeText(link);
      setAvisoCopia('Link copiado');
    } catch {
      setAvisoCopia('No se pudo copiar el link. Probá de nuevo.');
    }
  };

  const editar = () => {
    setConfirmandoVuelta(false);
    setPaso(origen === 'cuentas' ? 'cuentas' : 'lista');
  };

  return (
    <Container maxWidth='sm' disableGutters>
      <div className='App-panel'>
        {error && (
          <Typography color='error' mb={2}>
            {error}
          </Typography>
        )}

        {paso === 'lista' && (
          <Stack spacing={2}>
            <Typography component='h2' variant='h6' textAlign='center' width='100%'>
              ¿Cuánto puso cada uno?
            </Typography>

            {roster.map((nombre) => (
              <div className='member-row' key={nombre}>
                <TextField
                  size='small'
                  value={borradores[nombre] ?? nombre}
                  inputProps={{ 'aria-label': `Nombre de ${nombre}` }}
                  onChange={(e) => {
                    setBorradores((prev) => ({ ...prev, [nombre]: e.target.value }));
                    setError('');
                  }}
                  onBlur={() => confirmarNombre(nombre)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmarNombre(nombre);
                  }}
                  sx={{ flex: '1 1 auto', minWidth: 0 }}
                />
                <TextField
                  className='member-row__monto'
                  size='small'
                  type='text'
                  placeholder='0'
                  value={textoMonto(montos[nombre] ?? 0)}
                  inputProps={{
                    'aria-label': `Monto de ${nombre}`,
                    inputMode: 'numeric',
                  }}
                  onChange={(e) => actualizarMonto(nombre, e.target.value)}
                />
                <Button size='small' onClick={() => quitarNombre(nombre)}>
                  Quitar
                </Button>
              </div>
            ))}

            <div className='lista-alta'>
              <TextField
                label='Nombre'
                size='small'
                variant='outlined'
                value={nombreNuevo}
                onChange={(e) => {
                  setNombreNuevo(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') agregarNombre();
                }}
              />
              <Button variant='contained' onClick={agregarNombre}>
                Agregar
              </Button>
            </div>

            <Button variant='text' color='secondary' onClick={abrirCuentas}>
              ¿Hay otra cuenta, como el alcohol?
            </Button>
            <Button variant='contained' fullWidth onClick={calcular}>
              Calcular transferencias
            </Button>
          </Stack>
        )}

        {paso === 'cuentas' && (
          <Stack spacing={2}>
            <Typography component='h2' variant='h6'>
              Cuentas de la juntada
            </Typography>

            {cuentas.map((cuenta, indice) => (
              <Stack key={cuenta.id} spacing={1}>
                <TextField
                  size='small'
                  value={cuenta.nombre}
                  inputProps={{ 'aria-label': 'Nombre de la cuenta' }}
                  onChange={(e) => actualizarNombreCuenta(cuenta.id, e.target.value)}
                  onBlur={() => confirmarNombreCuenta(cuenta.id)}
                />

                {roster.map((nombre) => (
                  <div className='member-row' key={`${cuenta.id}-${nombre}`}>
                    {indice === 0 ? (
                      <TextField
                        size='small'
                        value={borradores[nombre] ?? nombre}
                        inputProps={{ 'aria-label': `Nombre de ${nombre}` }}
                        onChange={(e) => {
                          setBorradores((prev) => ({ ...prev, [nombre]: e.target.value }));
                          setError('');
                        }}
                        onBlur={() => confirmarNombre(nombre)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmarNombre(nombre);
                        }}
                        sx={{ flex: '1 1 auto', minWidth: 0 }}
                      />
                    ) : (
                      <Typography sx={{ flex: '1 1 auto', minWidth: 0 }}>{nombre}</Typography>
                    )}
                    <Checkbox
                      size='small'
                      checked={cuenta.incluido[nombre] ?? false}
                      onChange={(e) => actualizarIncluido(cuenta.id, nombre, e.target.checked)}
                      inputProps={{ 'aria-label': nombre }}
                    />
                    {cuenta.incluido[nombre] && (
                      <TextField
                        className='member-row__monto'
                        size='small'
                        type='text'
                        placeholder='0'
                        value={textoMonto(cuenta.montos[nombre] ?? 0)}
                        inputProps={{
                          'aria-label': `Monto de ${nombre} en ${cuenta.nombre}`,
                          inputMode: 'numeric',
                        }}
                        onChange={(e) => actualizarMontoCuenta(cuenta.id, nombre, e.target.value)}
                      />
                    )}
                    {indice === 0 && (
                      <Button size='small' onClick={() => quitarNombre(nombre)}>
                        Quitar
                      </Button>
                    )}
                  </div>
                ))}

                {cuentas.length >= 2 && (
                  <Button size='small' onClick={() => borrarCuenta(cuenta.id)}>
                    Borrar cuenta
                  </Button>
                )}
              </Stack>
            ))}

            <div className='lista-alta'>
              <TextField
                label='Nombre'
                size='small'
                variant='outlined'
                value={nombreNuevo}
                onChange={(e) => {
                  setNombreNuevo(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') agregarNombre();
                }}
              />
              <Button variant='contained' onClick={agregarNombre}>
                Agregar
              </Button>
            </div>

            <Button variant='contained' color='secondary' onClick={agregarCuenta}>
              Agregar cuenta
            </Button>
            <Button variant='outlined' onClick={pedirVolverAUnaCuenta}>
              Volver a una cuenta
            </Button>
            <Button variant='contained' fullWidth onClick={calcularDesdeCuentas}>
              Calcular transferencias
            </Button>
            {confirmandoVuelta && (
              <>
                <Typography>
                  {`Se borran ${cuentas
                    .slice(1)
                    .map((cuenta) => cuenta.nombre)
                    .join(', ')}. Queda una sola cuenta con los montos de la primera.`}
                </Typography>
                <Button onClick={() => cuentas[0] && volverConCuenta(cuentas[0])}>
                  Borrar las otras
                </Button>
                <Button onClick={() => setConfirmandoVuelta(false)}>Cancelar</Button>
              </>
            )}
          </Stack>
        )}

        {paso === 'resultado' && (
          <Stack spacing={2}>
            <Typography component='h2' variant='h6'>
              Transferencias
            </Typography>
            <Button variant='outlined' onClick={editar}>
              Editar
            </Button>
            {transferencias.length === 0 ? (
              <Typography>No hace falta transferir nada.</Typography>
            ) : (
              transferencias.map((transferencia) => (
                <Typography key={`${transferencia.de}-${transferencia.a}`}>
                  {transferencia.de} le transfiere ${transferencia.monto} a {transferencia.a}
                </Typography>
              ))
            )}
            {transferencias.length > 0 && <Typography>Alias de cobro</Typography>}
            {transferencias.length > 0 &&
              acreedoresDeTransferencias(transferencias).map((nombre) => (
                <TextField
                  key={nombre}
                  label={`Alias de ${nombre}`}
                  size='small'
                  value={aliases[nombre] ?? ''}
                  onChange={(e) => setAliases((prev) => ({ ...prev, [nombre]: e.target.value }))}
                />
              ))}
            <Button variant='contained' color='secondary' onClick={copiarResultado}>
              Copiar resultado
            </Button>
            <Button variant='outlined' onClick={copiarLink}>
              Copiar link
            </Button>
            {avisoCopia && <Typography>{avisoCopia}</Typography>}
            <Accordion defaultExpanded={false} TransitionProps={{ timeout: 0 }}>
              <AccordionSummary>
                <Typography>Cómo se calculó</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {desglose.map((subgrupo) => (
                  <Stack key={subgrupo.id} spacing={0.5}>
                    {origen === 'cuentas' && <Typography>{subgrupo.nombre}</Typography>}
                    <Typography>
                      {`Total $${subgrupo.total} · ${subgrupo.cantidadMiembros} personas · cuota $${subgrupo.cuota}`}
                    </Typography>
                    {subgrupo.lineas.map((linea) => (
                      <Typography key={`${subgrupo.id}-${linea.nombre}`}>
                        {`${linea.nombre}: puso $${linea.puso}, cuota $${
                          linea.cuota
                        }, saldo ${textoSaldo(linea.saldo)}`}
                      </Typography>
                    ))}
                  </Stack>
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
