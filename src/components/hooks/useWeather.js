import { useState, useEffect } from 'react';

export function useWeather() {
  const [nombreLugar, setNombreLugar] = useState('Introduce una ubicación');
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [listaOpciones, setListaOpciones] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Función interna para conectar con Open-Meteo
  const obtenerClima = async (lat, lon, nombre, unidadTemp='celsius', unidadViento='kn') => {
    setCargando(true);
    try {
      // MODIFICACIÓN: Quitamos current_weather y pedimos datos por hora (hourly) de temperatura y weather_code.
      // Añadimos &timezone=auto para que los códigos de tiempo coincidan con la hora local de la ciudad.
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m,relative_humidity_2m,wind_gusts_10m,precipitation&temperature_unit=${unidadTemp}&wind_speed_unit=${unidadViento}&wind_gusts_unit=${unidadViento}&forecast_days=10&timezone=auto`;
      const response = await fetch(weatherUrl);
      const data = await response.json();

      // CONEXIÓN CON CND: Mapeamos los arrays paralelos de Open-Meteo en una estructura limpia
      const historialCndHorario = data.hourly.time.map((timeStr, index) => {
        return {
          idTiempo: timeStr, // Formato string directo: "2026-06-09T15:00"
          objetoFecha: new Date(timeStr), // Objeto Date para operaciones nativas de JS
          temperatura: data.hourly.temperature_2m[index],
          cndCodigo: data.hourly.weather_code[index], // Este es el código de Meteorocón (0 = Despejado, 51 = Llovizna, etc.)
          isDay: data.hourly.is_day[index], // Agregamos si es día o noche
          viento: data.hourly.wind_speed_10m[index], // Agregamos la velocidad del viento
          humedad: data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[index] : null,// Agregamos humedad si está disponible
          direccionViento: data.hourly.wind_direction_10m ? data.hourly.wind_direction_10m[index] : null, // Agregamos dirección del viento si está disponible
          rafaga: data.hourly.wind_gusts_10m ? data.hourly.wind_gusts_10m[index] : null, // Agregamos ráfagas de viento si está disponible
          precipitacion: data.hourly.precipitation ? data.hourly.precipitation[index] : null // Agregamos precipitación si está disponible
        };
      });

      setNombreLugar(nombre);
      
      // Guardamos tanto los datos resumidos como la lista completa de CNDs para tus consultas
      setClima({
        // Opcional: guardamos el primer registro como referencia actual
        tempActual: data.hourly.temperature_2m[0],
        cndActual: data.hourly.weather_code[0],
        vientoActual: data.hourly.wind_speed_10m[0],
        // Esta es la lista que usarás en tu componente para buscar por hora
        cndHoras: historialCndHorario 
      });
      
      setListaOpciones([]);
      setTerminoBusqueda('');
    } catch (error) {
      console.log("Error al obtener el clima:", error);
      alert("No se pudieron obtener los datos del clima.");
    } finally {
      setCargando(false);
    }
  };

  // EFECTO DINÁMICO (Debounce) - Se mantiene idéntico
  useEffect(() => {
    if (!terminoBusqueda.trim() || terminoBusqueda.length < 3) {
      setListaOpciones([]);
      return;
    }

    const temporizador = setTimeout(async () => {
      try {
        const geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(terminoBusqueda) + "&count=5&language=es&format=json";
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.results && geoData.results.length > 0) {
          const opcionesFormateadas = geoData.results.map((item) => ({
            id: item.id,
            lat: item.latitude,
            lon: item.longitude,
            nombre: item.name,
            estado: item.admin1 || "",
            pais: item.country,
            textoMostrar: `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}, ${item.country}`
          }));
          setListaOpciones(opcionesFormateadas);
        } else {
          setListaOpciones([]);
        }
      } catch (error) {
        console.error("Error al buscar la ciudad de manera dinámica:", error);
      }
    }, 300);

    return () => clearTimeout(temporizador);
  }, [terminoBusqueda]);

  const seleccionarCiudadManualmente = (opcion) => {
    obtenerClima(opcion.lat, opcion.lon, opcion.textoMostrar);
  };

  const buscarPorGPS = () => {
    if (!navigator.geolocation) {
      return alert("Tu navegador no soporta geolocalización.");
    }

    setCargando(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const urlCiudad = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json';
          const response = await fetch(urlCiudad);

          if (!response.ok) throw new Error('Error en la geocodificación');
          const data = await response.json();

          const ciudad = data.address.city || data.address.town || data.address.village || data.address.suburb || "Ubicación Desconocida";
          const estado = data.address.state || "";
          const pais = data.address.country || "";

          const nombreCompleto = pais ? `${ciudad}, ${estado}, ${pais}` : ciudad;

          await obtenerClima(lat, lon, nombreCompleto);

        } catch (error) {
          console.error('Error al obtener el nombre de la ciudad:', error);
          await obtenerClima(lat, lon, "Tu Ubicación Actual");
        }
      },
      (error) => {
        alert("No se pudo acceder a tu ubicación. Revisa los permisos.");
        setCargando(false);
      }
    );
  };

  return {
    nombreLugar,
    clima,
    cargando,
    listaOpciones,
    terminoBusqueda,
    setTerminoBusqueda,
    seleccionarCiudadManualmente,
    buscarPorGPS
  };
}
