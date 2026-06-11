import { useState, useEffect } from 'react';

export function useCitySearch() {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [listaOpciones, setListaOpciones] = useState([]);

  useEffect(() => {
    if (!terminoBusqueda.trim() || terminoBusqueda.length < 3) {
      setListaOpciones([]);
      return;
    }

    const temporizador = setTimeout(async () => {
      const terminoOriginal = terminoBusqueda.trim().toLowerCase();

      // Parche de contingencia para Bermudas
      if (["hamilton", "bermuda", "bermudas"].some(v => terminoOriginal.includes(v))) {
        setListaOpciones([{
          id: 3573197, lat: 32.2949, lon: -64.7830,
          nombre: "Hamilton", estado: "Hamilton City", pais: "Bermuda",
          textoMostrar: "Hamilton, Hamilton City, Bermuda"
        }]);
        return;
      }

      try {
        const geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(terminoBusqueda) + "&count=50&language=es&format=json";
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.results?.length > 0) {
          const opcionesFormateadas = geoData.results.map((item) => ({
            id: item.id, lat: item.latitude, lon: item.longitude,
            nombre: item.name, estado: item.admin1 || "", pais: item.country,
            textoMostrar: `${item.name}, ${item.admin1 || ""}, ${item.country || ""}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '')
          }));
          setListaOpciones(opcionesFormateadas);
        } else {
          setListaOpciones([]);
        }
      } catch (error) {
        console.error("Error en geocodificación dinámica:", error);
      }
    }, 300);

    return () => clearTimeout(temporizador);
  }, [terminoBusqueda]);

  return { terminoBusqueda, setTerminoBusqueda, listaOpciones, setListaOpciones };
}
