import { useWeather } from '../hooks/useWeather.js';
// IMPORTAMOS EL ARCHIVO CSS SEPARADO
import './Weatherapp.css';

// Tus importaciones oficiales de @meteocons (se mantienen igual)
import clearDay from '@meteocons/svg/fill/clear-day.svg';
import clearNight from '@meteocons/svg/fill/clear-night.svg';
import partlyCloudyDay from '@meteocons/svg/fill/partly-cloudy-day.svg';
import partlyCloudyNight from '@meteocons/svg/fill/partly-cloudy-night.svg';
import overcastDay from '@meteocons/svg/fill/overcast-day.svg';
import overcastNight from '@meteocons/svg/fill/overcast-night.svg';
import fogDay from '@meteocons/svg/fill/fog-day.svg';
import fogNight from '@meteocons/svg/fill/fog-night.svg';
import drizzle from '@meteocons/svg/fill/drizzle.svg';
import rain from '@meteocons/svg/fill/rain.svg';
import snow from '@meteocons/svg/fill/snow.svg';
import thunderstormsDay from '@meteocons/svg/fill/thunderstorms-day.svg';
import thunderstormsNight from '@meteocons/svg/fill/thunderstorms-night.svg';

function WeatherApp() {
    const {
        nombreLugar,
        clima,
        cargando,
        buscarPorGPS,
        listaOpciones,
        seleccionarCiudadManualmente,
        terminoBusqueda,
        setTerminoBusqueda
    } = useWeather();

    const horasPronostico = (() => {
        if (!clima || !clima.cndHoras || clima.cndHoras.length === 0) return [];
        const ahora = new Date();
        ahora.setMinutes(0, 0, 0);

        const indiceActual = clima.cndHoras.findIndex(item => item.objetoFecha.getTime() === ahora.getTime());
        const inicio = indiceActual !== -1 ? indiceActual : 0;

        // Devolvemos toda la lista restante (las 240 horas completas de los 10 días)
        return clima.cndHoras.slice(inicio);
    })();

    function obtenerIconoMeteocon(code, esDia) {
        const deDia = esDia === 1;
        switch (code) {
            case 0: return deDia ? clearDay : clearNight;
            case 1: case 2: return deDia ? partlyCloudyDay : partlyCloudyNight;
            case 3: return deDia ? overcastDay : overcastNight;
            case 45: case 48: return deDia ? fogDay : fogNight;
            case 51: case 53: case 55: return drizzle;
            case 61: case 63: case 65: case 80: case 81: case 82: return rain;
            case 71: case 73: case 75: return snow;
            case 95: return deDia ? thunderstormsDay : thunderstormsNight;
            default: return deDia ? clearDay : clearNight;
        }
    }

    // Retorna la clase CSS correspondiente según la intensidad del viento en nudos
    const obtenerClaseViento = (nudos) => {
        if (nudos < 5) return 'wind-calm';
        if (nudos < 10) return 'wind-light';
        if (nudos < 15) return 'wind-moderate';
        if (nudos < 22) return 'wind-strong';
        return 'wind-gale';
    };

    const obtenerClaseTemperatura = (temp) => {
        if (temp <= -10) return 'temp-very-freezing';
        if (temp >= -10 && temp < 0) return 'temp-freezing';
        if (temp <= 0) return 'temp-very-cold';
        if (temp <= 10) return 'temp-cold';
        if (temp <= 20) return 'temp-mild';
        if (temp <= 30) return 'temp-warm';
        if (temp <= 40) return 'temp-hot';
        if (temp > 40) return 'temp-extreme';
        return 'temp-normal';
    }

    // FUNCIÓN AUXILIAR: Retorna el nombre abreviado del día (ej: "Lun 09")
    const obtenerEtiquetaDia = (date) => {
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return `${diasSemana[date.getDay()]} ${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="wg-container">

            <div className="search-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar spots de viento..."
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                />
                {listaOpciones && listaOpciones.length > 0 && (
                    <ul className="options-list">
                        {listaOpciones.map((opcion) => (
                            <li key={opcion.id}>
                                <button
                                    onClick={() => seleccionarCiudadManualmente(opcion)}
                                    className="option-btn"
                                >
                                    {opcion.textoMostrar}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button onClick={buscarPorGPS} className="gps-btn">
                📍 Buscar en mi Spot Actual (GPS)
            </button>

            <h2>{nombreLugar}</h2>
            {cargando && <p>Cargando tabla de Windguru...</p>}

            {!cargando && clima && horasPronostico.length > 0 && (
                <div className="wg-table-scroll">
                    <table className="wg-table">
                        <thead>
                            {/* NUEVA FILA: Cabecera superior de Días estilo Windguru */}
                            <tr style={{ backgroundColor: '#333', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>
                                <td style={{ padding: '6px' }}>Día</td>
                                {horasPronostico.map(h => (
                                    <td key={`day-${h.idTiempo}`} style={{ padding: '6px', borderRight: h.objetoFecha.getHours() === 23 ? '2px solid #fff' : 'none' }}>
                                        {obtenerEtiquetaDia(h.objetoFecha)}
                                    </td>
                                ))}
                            </tr>

                            {/* Fila 2: Horas (00h a 23h con divisor al finalizar el día) */}
                            <tr className="wg-row-header">
                                <td>Hora</td>
                                {horasPronostico.map(h => {
                                    const hStr = String(h.objetoFecha.getHours()).padStart(2, '0');
                                    // Si la hora es 23h, añadimos un borde derecho grueso para marcar visualmente el fin del día
                                    const estiloFinDia = h.objetoFecha.getHours() === 23 ? { borderRight: '2px solid #999' } : {};
                                    return <td key={h.idTiempo} className="wg-cell-time" style={estiloFinDia}>{hStr}h</td>;
                                })}
                            </tr>

                            {/* Fila 3: Meteorocones */}
                            <tr className="wg-row">
                                <td className="wg-cell-label">Clima</td>
                                {horasPronostico.map(h => (
                                    <td key={h.idTiempo} className="wg-cell-icon" style={h.objetoFecha.getHours() === 23 ? { borderRight: '2px solid #ddd' } : {}}>
                                        <img src={obtenerIconoMeteocon(h.cndCodigo, h.isDay)} alt="Meteocon" className="wg-icon" />
                                    </td>
                                ))}
                            </tr>

                            {/* Fila 4: Temperatura */}
                            <tr className="wg-row-bg-white">
                                <td className="wg-cell-label">Temp (°C)</td>
                                {horasPronostico.map(h => (
                                    <td key={h.idTiempo} className={`wg-cell-temp ${obtenerClaseTemperatura(h.temperatura)}`} style={h.objetoFecha.getHours() === 23 ? { borderRight: '2px solid #ddd' } : {}}>
                                        {Math.round(h.temperatura)}°
                                    </td>
                                ))}
                            </tr>

                            {/* Fila 5: Humedad */}
                            <tr className="wg-row">
                                <td className="wg-cell-label">Humedad</td>
                                {horasPronostico.map(h => (
                                    <td key={h.idTiempo} style={{ padding: '8px', fontSize: '12px', color: '#555', borderBottom: '1px solid #ddd', ...(h.objetoFecha.getHours() === 23 ? { borderRight: '2px solid #ddd' } : {}) }}>
                                        {h.humedad}%
                                    </td>
                                ))}
                            </tr>

                            {/* Fila 6: Viento (kn) */}
                            <tr className="wg-row">
                                <td className="wg-cell-label-bold">Viento (kn)</td>
                                {horasPronostico.map(h => (
                                    <td key={h.idTiempo} className={`wg-cell-wind ${obtenerClaseViento(h.viento)}`} style={h.objetoFecha.getHours() === 23 ? { borderRight: '2px solid #fff' } : {}}>
                                        {Math.round(h.viento)}
                                    </td>
                                ))}
                            </tr>

                            {/* Fila 7: Dirección del viento */}
                            <tr>
                                <td className="wg-cell-label">Dirección</td>
                                {horasPronostico.map(h => (
                                    <td key={h.idTiempo} className="wg-cell-dir" style={h.objetoFecha.getHours() === 23 ? { borderRight: '2px solid #ddd' } : {}}>
                                        <div className="wg-arrow" style={{ transform: `rotate(${h.direccionViento}deg)` }}>↓</div>
                                        <div className="wg-degrees">{h.direccionViento}°</div>
                                    </td>
                                ))}
                            </tr>

                            {/* Fila 8: Ráfagas de viento */}
                            <tr className="wg-row">
                                <td className="wg-cell-label" style={{ fontWeight: 'bold', color: '#444' }}>Ráfagas (kn)</td>
                                {horasPronostico.map(h => {
                                    // Aseguramos que sea un número válido
                                    const valorRafaga = isNaN(h.rafaga) || h.rafaga === undefined ? 0 : Number(h.rafaga);
                                    const esFinDia = h.objetoFecha.getHours() === 23;

                                    return (
                                        <td
                                            key={`gust-${h.idTiempo}`}
                                            className={`wg-cell-wind ${obtenerClaseViento(valorRafaga)}`}
                                            style={esFinDia ? { borderRight: '2px solid #fff', borderBottom: '1px solid #ddd' } : { borderBottom: '1px solid #ddd' }}
                                            translate="no"
                                        >
                                            {String(Math.round(valorRafaga))}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Fila 9: Precipitación */}
                            <tr className="wg-row-bg-white">
                                <td className="wg-cell-label">Lluvia (mm)</td>
                                {horasPronostico.map(h => {
                                    const esFinDia = h.objetoFecha.getHours() === 23;
                                    const tieneAgua = h.precipitacion > 0;
                                    return (
                                        <td
                                            key={`rain-${h.idTiempo}`}
                                            className={`wg-cell-rain ${tieneAgua ? 'has-rain' : ''}`}
                                            style={esFinDia ? { borderRight: '2px solid #ddd', borderBottom: '1px solid #ddd' } : { borderBottom: '1px solid #ddd' }}
                                        >
                                            {tieneAgua ? `${h.precipitacion.toFixed(1)}` : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        </thead>
                    </table>
                </div>
            )}

            {!clima && !cargando && (
                <p className="wg-footer-text">Busca un spot para desplegar la tabla de viento.</p>
            )}
        </div>
    );
}

export default WeatherApp;
