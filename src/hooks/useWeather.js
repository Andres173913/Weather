// hooks/useWeather.js
import { useState } from 'react';
import { useCitySearch } from './useCitySearch.js';
import { useFetchWeather } from './useFetchWeather.js';
// Asegurate de que acá estás importando el archivo donde modificamos el Import de TidePredictor
import { useFetchGlobalTides } from './useFetchGlobalTides.js';
import { useGPS } from './useGPS';

export function useWeather() {
  const [nombreLugar, setNombreLugar] = useState('Introduce una ubicación');
  const [coordenadas, setCoordenadas] = useState({ lat: null, lon: null });

  const { terminoBusqueda, setTerminoBusqueda, listaOpciones, setListaOpciones } = useCitySearch();
  const limpiarBuscador = () => { setListaOpciones([]); setTerminoBusqueda(''); };

  const { clima, cargando, obtenerClima, setCargando } = useFetchWeather(setNombreLugar, limpiarBuscador);

  // Consumimos el predictor global usando el estado único de coordenadas
  const { mareaHoras, cargandoMarea, estacionNombre } = useFetchGlobalTides(coordenadas.lat, coordenadas.lon);

  // Envoltorio para interceptar las coordenadas del GPS cuando useGPS las obtenga
  const manejarGPS = async () => {
    setCargando(true);
    // 1. PRIMERO LIMPIAMOS LAS COORDENADAS VIEJAS: 
    // Esto obliga a que useFetchGlobalTides se ponga en null mientras el GPS calcula la nueva posición.
    setCoordenadas({ lat: null, lon: null });

    // 2. Ejecutamos tu lógica nativa del GPS pasándole el callback para capturar la nueva posición
    buscarPorGPS((lat, lon, nombre) => {
      // Al setear las nuevas coordenadas de Rosario, useFetchGlobalTides se vuelve a activar,
      // detecta el río (variación <= 0.01) y oculta la marea correctamente.
      setCoordenadas({ lat, lon });
      obtenerClima(lat, lon, nombre);
    });
  };

  const { buscarPorGPS } = useGPS(setCargando, obtenerClima);

  // Envoltorio para la selección manual
  const seleccionarCiudadManualmente = (opcion) => {
    setCoordenadas({ lat: opcion.lat, lon: opcion.lon });
    obtenerClima(opcion.lat, opcion.lon, opcion.textoMostrar);
  };

  return {
    nombreLugar,
    clima,
    mareas: mareaHoras, // Viaja directo a WeatherApp
    estacionNombre,     // Para mostrar en la UI de qué puerto calcula los datos
    cargando: cargando || cargandoMarea,
    buscarPorGPS: manejarGPS, // Pasamos la función interceptora para el GPS
    listaOpciones,
    seleccionarCiudadManualmente,
    terminoBusqueda,
    setTerminoBusqueda
  };
}