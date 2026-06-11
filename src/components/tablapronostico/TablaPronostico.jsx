import React from "react";
import "./TablaPronostico.css";
import {
    obtenerIconoMeteocon,
    obtenerClaseViento,
    obtenerClaseTemperatura,
    obtenerEtiquetaDia,
    obtenerClaseRafagas,
    obtenerClaseHumedad,
    obtenerIconoViento
} from '../../utils/weatherHelpers.js';

function TablaPronostico({ horasPronostico, mareas }) {
    const celdaBordeFinDia = (h) => h.objetoFecha.getHours() === 23 ? { borderRight: '2px solid #ddd' } : {};

    const obtenerStyleNube = (porcentaje) => {
        // Calculamos el valor de la escala de grises (255 es blanco, 60 es gris oscuro)
        // A mayor porcentaje, más cerca de 60 estará (más oscuro)
        const v = Math.round(255 - (porcentaje * 1.95));

        return {
            backgroundColor: `rgb(${v}, ${v}, ${v})`,
            // Si el fondo es muy oscuro (v < 130), la letra pasa a ser blanca para que se lea
            color: v < 130 ? '#ffffff' : '#2c3e50',
        };
    };

    return (
        <div className="wg-table-scroll">
            <table className="wg-table">
                <thead>
                    {/* Fila de días */}
                    <tr style={{ backgroundColor: '#333', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>
                        <td style={{ padding: '6px' }}>Día</td>
                        {horasPronostico.map(h => (
                            <td key={`day-${h.idTiempo}`} style={{ padding: '6px', borderRight: h.objetoFecha.getHours() === 23 ? '2px solid #fff' : 'none' }}>
                                {obtenerEtiquetaDia(h.objetoFecha)}
                            </td>
                        ))}
                    </tr>
                    {/* Fila de horas */}
                    <tr className="wg-row-header">
                        <td>Hora</td>
                        {horasPronostico.map(h => (
                            <td key={`time-${h.idTiempo}`} className="wg-cell-time" style={h.objetoFecha.getHours() === 23 ? { borderRight: '2px solid #999' } : {}}>
                                {String(h.objetoFecha.getHours()).padStart(2, '0')}h
                            </td>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Clima (icono) */}
                    <tr className="wg-row">
                        <td className="wg-cell-label">Clima</td>
                        {horasPronostico.map(h => (
                            <td key={`icon-${h.idTiempo}`} className="wg-cell-icon" style={celdaBordeFinDia(h)}>
                                <img src={obtenerIconoMeteocon(h.cndCodigo, h.isDay)} alt="Meteocon" className="wg-icon" />
                            </td>
                        ))}
                    </tr>

                    {/* Temperatura */}
                    {horasPronostico.some(h => h.temperatura !== null) && (
                        <tr className="wg-row-bg-white">
                            <td className="wg-cell-label">Temp (°C)</td>
                            {horasPronostico.map(h => (
                                <td key={`temp-${h.idTiempo}`} className={`wg-cell-temp ${obtenerClaseTemperatura(h.temperatura)}`} style={celdaBordeFinDia(h)}>
                                    {h.temperatura !== null ? h.temperatura.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '°' : '-'}
                                </td>
                            ))}
                        </tr>
                    )}

                    {/* Humedad */}
                    {(horasPronostico.some(h => h.humidity !== null) || horasPronostico.some(h => h.humedad !== null)) && (
                        <tr className="wg-row-bg-white">
                            <td className="wg-cell-label">Humedad</td>
                            {horasPronostico.map(h => {
                                // Evaluamos ambas opciones por si tu hook la guarda en inglés o español
                                const valorCrudo = h.humidity !== undefined ? h.humidity : h.humedad;
                                const humVal = valorCrudo !== null && valorCrudo !== undefined ? Math.round(valorCrudo) : null;

                                return (
                                    <td
                                        key={`hum-${h.idTiempo}`}
                                        className={`wg-cell-humidity ${obtenerClaseHumedad(valorCrudo)} notranslate`}
                                        translate="no"
                                        style={{ ...celdaBordeFinDia(h), padding: '8px' }}
                                    >
                                        {humVal !== null && !isNaN(humVal) ? (
                                            <>
                                                {humVal}
                                                <span className="cloud-pct">
                                                    {'\u0025'}
                                                </span>
                                            </>
                                        ) : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    )}

                    {/* Viento */}
                    {horasPronostico.some(h => h.viento !== null) && (
                        <tr className="wg-row-bg-white">
                            <td className="wg-cell-label">Viento (kn)</td>
                            {horasPronostico.map(h => (
                                <td key={`wind-${h.idTiempo}`} className={`wg-cell-wind ${obtenerClaseViento(h.viento)}`} style={celdaBordeFinDia(h)}>
                                    {h.viento !== null ? h.viento.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '-'}
                                </td>
                            ))}
                        </tr>
                    )}

                    {/* Ráfagas */}
                    {horasPronostico.some(h => h.rafaga !== null) && (
                        <tr className="wg-row-bg-white">
                            <td className="wg-cell-label">Ráfagas (kn)</td>
                            {horasPronostico.map(h => {
                                return (
                                    <td key={`gust-${h.idTiempo}`} className={`wg-cell-gusts ${obtenerClaseRafagas(h.rafaga)}`} style={celdaBordeFinDia(h)}>
                                        {h.rafaga !== null ? h.rafaga.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    )}

                    {/* Dirección del viento */}
                    <tr className="wg-row">
                        <td className="wg-cell-label">Dirección</td>
                        {horasPronostico.map((h) => {
                            const gradosRaw = h.direccionViento;
                            const grados = parseFloat(gradosRaw) || 0;

                            return (
                                <td
                                    key={`wind-dir-${h.idTiempo}`}
                                    style={celdaBordeFinDia(h)}
                                    className="wg-cell-wind"
                                >
                                    <div className="wind-dir-container">
                                        {/* Flecha pura CSS */}
                                        <div
                                            className="wind-arrow-pure"
                                            style={{ transform: `rotate(${grados}deg)` }}
                                            title={`Dirección: ${grados}°`}
                                        />
                                        <span className="wind-degrees-text">
                                            {grados}°
                                        </span>
                                    </div>
                                </td>
                            );
                        })}
                    </tr>

                    {/* Fila: Nubes Altas */}
                    <tr className="wg-row">
                        <td className="wg-cell-label">Nubes Altas (Cirrus)</td>
                        {horasPronostico.map((h) => {
                            const nAltas = Math.round(h.nubesAltas ?? 0);
                            return (
                                <td
                                    key={`cloud-h-${h.idTiempo}`}
                                    style={{ ...celdaBordeFinDia(h), ...obtenerStyleNube(nAltas) }}
                                    className="wg-cell-clouds"
                                >
                                    {nAltas}
                                    <span className="cloud-pct notranslate" translate="no">
                                        {'\u0025'}
                                    </span>
                                </td>
                            );
                        })}
                    </tr>

                    {/* Fila: Nubes Medias (Altocumulus) */}
                    <tr className="wg-row">
                        <td className="wg-cell-label">Nubes Medias</td>
                        {horasPronostico.map((h) => {
                            const nMedias = Math.round(h.nubesMedias ?? 0);
                            return (
                                <td
                                    key={`cloud-m-${h.idTiempo}`}
                                    style={{ ...celdaBordeFinDia(h), ...obtenerStyleNube(nMedias) }}
                                    className="wg-cell-clouds"
                                >
                                    {nMedias}
                                    <span className="cloud-pct notranslate" translate="no">
                                        {'\u0025'}
                                    </span>
                                </td>
                            );
                        })}
                    </tr>

                    {/* Fila: Nubes Bajas (Cumulus/Stratus) */}
                    <tr className="wg-row">
                        <td className="wg-cell-label" style={{ fontWeight: 'bold' }}>Nubes Bajas (Base)</td>
                        {horasPronostico.map((h) => {
                            const nBajas = Math.round(h.nubesBajas ?? 0);
                            return (
                                <td
                                    key={`cloud-l-${h.idTiempo}`}
                                    style={{ ...celdaBordeFinDia(h), ...obtenerStyleNube(nBajas) }}
                                    className="wg-cell-clouds"
                                >
                                    {nBajas}
                                    <span className="cloud-pct notranslate" translate="no">
                                        {'\u0025'}
                                    </span>
                                </td>
                            );
                        })}
                    </tr>

                    {/* Precipitaciones */}
                    {horasPronostico.some(h => h.precipitacion !== null) && (
                        <tr className="wg-row-bg-white">
                            <td className="wg-cell-label">Precipitación (mm)</td>
                            {horasPronostico.map(h => (
                                <td key={`rain-${h.idTiempo}`} className={`wg-cell-rain ${h.precipitacion > 0 ? 'has-rain' : ''}`} style={celdaBordeFinDia(h)}>
                                    {h.precipitacion !== null ? `${h.precipitacion.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}` : '-'}
                                </td>
                            ))}
                        </tr>
                    )}

                    {/* Mareas Astronómicas */}
                    {mareas && mareas.length > 0 && (
                        <tr className="wg-row">
                            <td className="wg-cell-label">Marea Astronómica</td>
                            {horasPronostico.map((h) => {
                                const inicioHora = new Date(h.objetoFecha);
                                inicioHora.setMinutes(0, 0, 0);

                                const finHora = new Date(inicioHora);
                                finHora.setHours(finHora.getHours() + 1);

                                const mareaHito = mareas.find(m => {
                                    const tiempoMarea = new Date(m.objetoFecha).getTime();
                                    return tiempoMarea >= inicioHora.getTime() && tiempoMarea < finHora.getTime();
                                });

                                const tieneMarea = !!mareaHito;
                                const esAlta = tieneMarea && mareaHito.tipo === 'high';
                                const claseMarea = tieneMarea ? (esAlta ? 'tide-high' : 'tide-low') : '';

                                return (
                                    <td
                                        key={`tide-${h.idTiempo}`}
                                        className={claseMarea}
                                        style={{
                                            ...celdaBordeFinDia(h),
                                            padding: '8px',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            backgroundColor: tieneMarea ? (esAlta ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)') : 'transparent',
                                            color: tieneMarea ? (esAlta ? '#10b981' : '#0ea5e9') : 'inherit'
                                        }}
                                    >
                                        {tieneMarea ? (
                                            <div>
                                                <div>{esAlta ? '▲ PLEAMAR' : '▼ BAJA'}</div>
                                                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                                                    {mareaHito.altura.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}m
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#bbb' }}>-</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TablaPronostico;