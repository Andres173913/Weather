// src/hooks/useFetchGlobalTides.js
import { useState, useEffect } from 'react';

export function useFetchGlobalTides(lat, lon) {
  const [mareaHoras, setMareaHoras] = useState(null);
  const [cargandoMarea, setCargandoMarea] = useState(false);
  const [estacionNombre, setEstacionNombre] = useState('');

  useEffect(() => {
    if (!lat || !lon) {
      setMareaHoras(null);
      return;
    }

    const obtenerMareasOpenMeteo = async () => {
      setCargandoMarea(true);
      try {
        const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al conectar con el servicio oceanográfico');

        const data = await response.json();

        if (!data.hourly || !data.hourly.wave_height) {
          throw new Error('Esta ubicación no cuenta con datos marinos disponibles.');
        }

        const horasMarea = data.hourly.time;
        const alturasMarea = data.hourly.wave_height;

        // 1. PRIMERO DECLARAMOS Y ARMAMOS LA CURVA COMPLETA
        const curvaCompleta = horasMarea.map((tiempoStr, index) => ({
          objetoFecha: new Date(tiempoStr),
          altura: alturasMarea[index]
        }));

        // 2. AHORA SÍ: CONTROL DE VALIDACIÓN FLUVIAL / TIERRA ADENTRO
        const primeras24Horas = curvaCompleta.slice(0, 24);
        const alturas24h = primeras24Horas.map(item => item.altura);
        const max24h = Math.max(...alturas24h);
        const min24h = Math.min(...alturas24h);
        const variacionTotal = max24h - min24h;

        // Bajamos el umbral a 0.01m. Si da 0 o casi cero, es un río/tierra adentro.
        // Si hay aunque sea 1 o 2 cm de variación, es un spot de mar planchado.
        if (variacionTotal <= 0.01) {
          setMareaHoras(null);
          setEstacionNombre('');
          return;
        }

        // Si pasa este micro-filtro, se enciende la marea
        setEstacionNombre('Modelo de Olas Oceánico (Open-Meteo)');

        // 3. CALCULAMOS LOS EXTREMOS ABSOLUTOS DIARIOS
        const picosCalculados = [];
        const curvasPorDia = {};

        curvaCompleta.forEach(item => {
          const fechaStr = item.objetoFecha.toISOString().split('T')[0];
          if (!curvasPorDia[fechaStr]) curvasPorDia[fechaStr] = [];
          curvasPorDia[fechaStr].push(item);
        });

        Object.keys(curvasPorDia).forEach(fechaStr => {
          const unDiaData = curvasPorDia[fechaStr];

          const maximaDelDia = unDiaData.reduce((max, item) => item.altura > max.altura ? item : max, unDiaData[0]);
          const minimaDelDia = unDiaData.reduce((min, item) => item.altura < min.altura ? item : min, unDiaData[0]);

          picosCalculados.push({
            idTiempo: maximaDelDia.objetoFecha.toISOString(),
            objetoFecha: maximaDelDia.objetoFecha,
            tipo: 'high',
            altura: maximaDelDia.altura
          });

          picosCalculados.push({
            idTiempo: minimaDelDia.objetoFecha.toISOString(),
            objetoFecha: minimaDelDia.objetoFecha,
            tipo: 'low',
            altura: minimaDelDia.altura
          });
        });

        picosCalculados.sort((a, b) => a.objetoFecha.getTime() - b.objetoFecha.getTime());

        setMareaHoras(picosCalculados);

      } catch (error) {
        console.warn("⚠️ No hay mareas para esta coordenada: " + error.message);
        setMareaHoras(null);
        setEstacionNombre('');
      } finally {
        setCargandoMarea(false);
      }
    };

    obtenerMareasOpenMeteo();
  }, [lat, lon]);

  return { mareaHoras, cargandoMarea, estacionNombre };
}