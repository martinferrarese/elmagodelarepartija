import {
  Button,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { puedeAgregarAlRoster } from './repartija/calcular';
import {
  CUENTA_JUEVES_STORAGE_KEY,
  conMontoEditado,
  conNombre,
  conPago,
  conPersona,
  conRedondeo,
  conTotal,
  cuentaVacia,
  cuotaVigenteCentavos,
  faltaCentavos,
  formatearPesos,
  leerCuentaJueves,
  morosos,
  parsearPesos,
  pasanLaCuota,
  sinPersona,
  textoMontoCentavos,
  textoMontoEnCurso,
  totalAJuntarCentavos,
  type CuentaJueves as EstadoCuenta,
} from './repartija/cuentaJueves';

function nuevoId(): string {
  const actual = globalThis.crypto;
  if (actual && typeof actual.randomUUID === 'function') return actual.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function leerInicial(): EstadoCuenta {
  try {
    return leerCuentaJueves(localStorage.getItem(CUENTA_JUEVES_STORAGE_KEY));
  } catch {
    return cuentaVacia();
  }
}

function CuentaJueves() {
  const [cuenta, setCuenta] = useState<EstadoCuenta>(leerInicial);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [borradoresNombre, setBorradoresNombre] = useState<Record<string, string>>({});
  const [borradoresMonto, setBorradoresMonto] = useState<Record<string, string>>({});
  const [borradorTotal, setBorradorTotal] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(CUENTA_JUEVES_STORAGE_KEY, JSON.stringify(cuenta));
  }, [cuenta]);

  const cuota = cuotaVigenteCentavos(cuenta.totalCentavos, cuenta.personas.length, cuenta.redondeo);
  const falta = faltaCentavos(cuenta);
  const anotado = cuenta.personas.reduce((suma, persona) => suma + persona.montoCentavos, 0);
  const deuda = morosos(cuenta);
  const pasan = pasanLaCuota(cuenta);

  const cambiarTotal = (texto: string) => {
    if (!textoMontoEnCurso(texto)) return;
    const parseado = parsearPesos(texto);
    if (parseado === null) {
      setBorradorTotal(texto);
      return;
    }
    setCuenta(conTotal(cuenta, parseado));
    setBorradorTotal(textoMontoCentavos(parseado) === texto ? null : texto);
  };

  const confirmarTotal = () => {
    const texto = (borradorTotal ?? textoMontoCentavos(cuenta.totalCentavos)).replace(/,$/, '');
    const parseado = parsearPesos(texto);
    setCuenta(conTotal(cuenta, parseado ?? cuenta.totalCentavos));
    setBorradorTotal(null);
  };

  const cambiarMonto = (id: string, texto: string) => {
    if (!textoMontoEnCurso(texto)) return;
    const parseado = parsearPesos(texto);
    if (parseado === null) {
      setBorradoresMonto((prev) => ({ ...prev, [id]: texto }));
      return;
    }
    const siguiente = conMontoEditado(cuenta, id, parseado);
    setCuenta(siguiente);
    const guardado = siguiente.personas.find((persona) => persona.id === id)?.montoCentavos ?? 0;
    setBorradoresMonto((prev) => {
      const copia = { ...prev };
      if (textoMontoCentavos(guardado) === texto || guardado !== parseado) delete copia[id];
      else copia[id] = texto;
      return copia;
    });
  };

  const confirmarMonto = (id: string, montoCentavos: number) => {
    const texto = (borradoresMonto[id] ?? textoMontoCentavos(montoCentavos)).replace(/,$/, '');
    const parseado = parsearPesos(texto);
    if (parseado !== null) setCuenta(conMontoEditado(cuenta, id, parseado));
    setBorradoresMonto((prev) => {
      const copia = { ...prev };
      delete copia[id];
      return copia;
    });
  };

  const agregar = () => {
    if (
      !puedeAgregarAlRoster(
        cuenta.personas.map((persona) => persona.nombre),
        nombreNuevo,
      )
    ) {
      setError('Nombre vacío o duplicado.');
      return;
    }
    setCuenta(
      conPersona(cuenta, {
        id: nuevoId(),
        nombre: nombreNuevo.trim(),
        montoCentavos: 0,
      }),
    );
    setNombreNuevo('');
    setError('');
  };

  const confirmarNombre = (id: string, nombreActual: string) => {
    const limpio = (borradoresNombre[id] ?? nombreActual).trim();
    const duplicado = cuenta.personas.some(
      (persona) => persona.id !== id && persona.nombre === limpio,
    );
    if (!limpio || duplicado) {
      setBorradoresNombre((prev) => ({ ...prev, [id]: nombreActual }));
      setError('Nombre vacío o duplicado.');
      return;
    }
    setCuenta(conNombre(cuenta, id, limpio));
    setBorradoresNombre((prev) => {
      const copia = { ...prev };
      delete copia[id];
      return copia;
    });
    setError('');
  };

  const vaciar = () => {
    setCuenta(cuentaVacia());
    setNombreNuevo('');
    setError('');
    setConfirmando(false);
    setBorradoresNombre({});
    setBorradoresMonto({});
    setBorradorTotal(null);
  };

  return (
    <Container maxWidth='sm' disableGutters>
      <div className='App-panel'>
        <Stack spacing={2}>
          {error && <Typography color='error'>{error}</Typography>}
          <Typography component='h2' variant='h6' textAlign='center'>
            Cuenta del jueves
          </Typography>
          <TextField
            label='Total'
            size='small'
            value={borradorTotal ?? textoMontoCentavos(cuenta.totalCentavos)}
            inputProps={{ inputMode: 'decimal', 'aria-label': 'Total' }}
            onChange={(event) => cambiarTotal(event.target.value)}
            onBlur={confirmarTotal}
          />
          <FormControlLabel
            control={
              <Switch
                checked={cuenta.redondeo}
                onChange={(event) => setCuenta(conRedondeo(cuenta, event.target.checked))}
              />
            }
            label='Redondeo'
          />
          <Typography>{`Total a juntar $${formatearPesos(
            totalAJuntarCentavos(cuenta),
          )}`}</Typography>
          <Typography>{cuota === null ? 'Cuota —' : `Cuota $${formatearPesos(cuota)}`}</Typography>
          <Typography>{`Anotado $${formatearPesos(anotado)}`}</Typography>
          <Typography>
            {falta < 0 ? `Sobran $${formatearPesos(-falta)}` : `Falta $${formatearPesos(falta)}`}
          </Typography>

          {deuda.length > 0 && (
            <Stack spacing={0.5}>
              <Typography component='h3' variant='subtitle1'>
                Morosos
              </Typography>
              {deuda.map((persona) => (
                <Typography key={persona.id}>
                  {`${persona.nombre} · faltan $${formatearPesos(persona.diferenciaCentavos)}`}
                </Typography>
              ))}
            </Stack>
          )}

          {pasan.length > 0 && (
            <Stack spacing={0.5}>
              <Typography component='h3' variant='subtitle1'>
                Pasan la cuota
              </Typography>
              {pasan.map((persona) => (
                <Typography key={persona.id}>
                  {`${persona.nombre} · pasan $${formatearPesos(persona.diferenciaCentavos)}`}
                </Typography>
              ))}
            </Stack>
          )}

          {cuenta.personas.map((persona) => (
            <div className='jueves-fila' key={persona.id}>
              <TextField
                className='jueves-fila__nombre'
                size='small'
                value={borradoresNombre[persona.id] ?? persona.nombre}
                inputProps={{ 'aria-label': `Nombre de ${persona.nombre}` }}
                onChange={(event) => {
                  setBorradoresNombre((prev) => ({ ...prev, [persona.id]: event.target.value }));
                  setError('');
                }}
                onBlur={() => confirmarNombre(persona.id, persona.nombre)}
              />
              <TextField
                className='jueves-fila__monto'
                size='small'
                value={borradoresMonto[persona.id] ?? textoMontoCentavos(persona.montoCentavos)}
                placeholder='0'
                inputProps={{ inputMode: 'decimal', 'aria-label': `Monto de ${persona.nombre}` }}
                onChange={(event) => cambiarMonto(persona.id, event.target.value)}
                onBlur={() => confirmarMonto(persona.id, persona.montoCentavos)}
              />
              <Button
                size='small'
                variant='outlined'
                aria-label={`Pagó de ${persona.nombre}`}
                onClick={() => {
                  setCuenta(conPago(cuenta, persona.id));
                  setBorradoresMonto((prev) => {
                    const copia = { ...prev };
                    delete copia[persona.id];
                    return copia;
                  });
                }}
              >
                Pagó
              </Button>
              <Button
                size='small'
                aria-label={`Quitar a ${persona.nombre}`}
                onClick={() => setCuenta(sinPersona(cuenta, persona.id))}
              >
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
              onChange={(event) => {
                setNombreNuevo(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') agregar();
              }}
            />
            <Button variant='contained' onClick={agregar}>
              Agregar
            </Button>
          </div>

          <Button variant='outlined' onClick={() => setConfirmando(true)}>
            Vaciar cuenta
          </Button>
          {confirmando && (
            <>
              <Typography>¿Vaciar la cuenta?</Typography>
              <Button variant='contained' color='secondary' onClick={vaciar}>
                Sí, vaciar
              </Button>
              <Button onClick={() => setConfirmando(false)}>Cancelar</Button>
            </>
          )}
        </Stack>
      </div>
    </Container>
  );
}

export default CuentaJueves;
