// src/hooks/useFetchWeather.js
import { useState } from 'react';

export function useFetchWeather(setNombreLugar, limpiarBuscador) {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(false);

  const obtenerClima = async (lat, lon, nombre, unidadTemp = 'celsius', unidadViento = 'kn') => {
    setCargando(true);
    try {
      // 1. URL ACTUALIZADA: Sumamos el parámetro &daily con las variables astronómicas
     const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m,relative_humidity_2m,wind_gusts_10m,precipitation,cloud_cover_low,cloud_cover_mid,cloud_cover_high&daily=sunrise,sunset&temperature_unit=${unidadTemp}&wind_speed_unit=${unidadViento}&forecast_days=10&timezone=auto`;

      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error(`Error en el servidor de clima: ${response.status}`);
      const data = await response.json();

      const rafagas = data.hourly.wind_gusts_10m ? data.hourly.wind_gusts_10m : null;
      const rafagaknots = unidadViento === 'kn' && rafagas ? rafagas.map(gust => gust / 1.94384) : rafagas; // Convertir a nudos si es necesario

      // El mapeo de historialCndHorario se queda EXACTAMENTE IGUAL a como lo tenés ahora...
      const historialCndHorario = data.hourly.time.map((timeStr, index) => ({
        // ... todo tu código actual del map ...
        idTiempo: timeStr,
        objetoFecha: new Date(timeStr),
        temperatura: data.hourly.temperature_2m[index],
        cndCodigo: data.hourly.weather_code[index],
        isDay: data.hourly.is_day[index],
        viento: data.hourly.wind_speed_10m[index],
        humidity: data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[index] : null,
        direccionViento: data.hourly.wind_direction_10m ? data.hourly.wind_direction_10m[index] : null,
        rafaga: rafagaknots ? rafagaknots[index] : null,
        precipitacion: data.hourly.precipitation ? data.hourly.precipitation[index] : null,
        nubesBajas: data.hourly.cloud_cover_low ? data.hourly.cloud_cover_low[index] : 0,
        nubesMedias: data.hourly.cloud_cover_mid ? data.hourly.cloud_cover_mid[index] : 0,
        nubesAltas: data.hourly.cloud_cover_high ? data.hourly.cloud_cover_high[index] : 0
      }));

      setNombreLugar(nombre);

      // 2. GUARDAMOS EL OBJETO DAILY EN EL ESTADO
      setClima({
        tempActual: data.hourly.temperature_2m,
        cndActual: data.hourly.weather_code,
        vientoActual: data.hourly.wind_speed_10m,
        cndHoras: historialCndHorario,
        // Inyectamos los datos astronómicos diarios directos de la API
        astrosDias: data.daily
      });
      limpiarBuscador();

    } catch (error) {
      console.error("Error crítico al obtener el clima:", error);
      alert("No se pudieron obtener los datos de la ubicación.");
    } finally {
      setCargando(false);
    }
  };

  return { clima, cargando, obtenerClima, setCargando };
}