// hooks/useGPS.js
export function useGPS(setCargando, obtenerClima) {
  const buscarPorGPS = () => {
    if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización.");

    setCargando(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        try {
          const urlCiudad = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json';
          const response = await fetch(urlCiudad, { headers: { "User-Agent": "MiAppClima/1.0" } });
          if (!response.ok) throw new Error('Error en geocodificación inversa');
          const data = await response.json();

          const ciudad = data.address.city || data.address.town || data.address.village || data.address.suburb || "Ubicación Desconocida";
          const nombreCompleto = data.address.country ? `${ciudad}, ${data.address.state || ""}, ${data.address.country}` : ciudad;

          await obtenerClima(lat, lon, nombreCompleto);
        } catch (error) {
          console.error(error);
          await obtenerClima(lat, lon, "Tu Ubicación Actual");
        }
      },
      () => {
        alert("No se pudo acceder a tu ubicación.");
        setCargando(false);
      }
    );
  };

  return { buscarPorGPS };
}
