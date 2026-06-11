// src/components/weatherapp/WeatherApp.jsx
import { useWeather } from '../../hooks/useWeather.js';
import TablaPronostico from '../tablapronostico/TablaPronostico.jsx';
import BuscadorCiudades from '../buscadorciudades/BuscadorCiudades.jsx';
import PanelAstronomico from '../PanelAstronomico/PanelAstronomico.jsx';
import './Weatherapp.css';

function WeatherApp() {
    const {
        nombreLugar,
        clima,
        mareas, // <-- Recibimos las mareas limpias calculadas por el Hub
        estacionNombre,
        cargando,
        buscarPorGPS,
        listaOpciones,
        seleccionarCiudadManualmente,
        terminoBusqueda,
        setTerminoBusqueda
    } = useWeather();

    // LÓGICA DE RECORTADO HORARIO (Solo para el Clima)
    const climaFinal = (() => {
        if (!clima || !clima.cndHoras || clima.cndHoras.length === 0) return [];

        const ahora = new Date();
        ahora.setMinutes(0, 0, 0);

        const inicio = clima.cndHoras.findIndex(item => item.objetoFecha.getTime() === ahora.getTime());
        const indexValido = inicio !== -1 ? inicio : 0;

        return clima.cndHoras.slice(indexValido);
    })();

    return (
        <div className="wg-container">
            <section className="header">
                <BuscadorCiudades
                    terminoBusqueda={terminoBusqueda}
                    setTerminoBusqueda={setTerminoBusqueda}
                    listaOpciones={listaOpciones}
                    seleccionarCiudadManualmente={seleccionarCiudadManualmente}
                />

                <button onClick={buscarPorGPS} className="gps-btn">
                    📍 Buscar en mi Spot Actual (GPS)
                </button>
            </section>
            <h2>{nombreLugar}</h2>
            {estacionNombre && (
                <p className="estacion-info">
                    🌊 Puerto de referencia: <strong>{estacionNombre}</strong>
                </p>
            )}

            {cargando && <p>Cargando datos meteorológicos y náuticos...</p>}

            {clima && (
                <>
                    {/* Tu tabla de siempre */}
                    <TablaPronostico horasPronostico={clima.cndHoras} mareas={mareas} />

                    {/* El nuevo componente desacoplado justo abajo */}
                    <PanelAstronomico astrosDias={clima.astrosDias} />
                </>
            )}
        </div>
    );
}

export default WeatherApp;