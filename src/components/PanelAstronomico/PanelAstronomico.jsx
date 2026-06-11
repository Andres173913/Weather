import React from 'react';
import './PanelAstronomico.css';
import sunriseIcon from '@meteocons/svg/fill/sunrise.svg';
import sunsetIcon from '@meteocons/svg/fill/sunset.svg';

function PanelAstronomico({ astrosDias }) {
    // Si no hay datos del sol, ocultamos el panel
    if (!astrosDias || !astrosDias.sunrise) return null;

    const formatearHora = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }) + 'h';
    };

    return (
        <div className="astro-panel-container">
            <h3 className="astro-panel-title">Información Solar (Hoy)</h3>
            <div className="astro-grid">
                
                {/* SOL: Salida */}
                <div className="astro-card">
                    <div className="astro-icon-wrapper">
                        {/* Asegurate de apuntar a la ruta real de tus iconos de meteocons */}
                        <img src={sunriseIcon} alt="Amanecer" />
                    </div>
                    <div className="astro-info">
                        <span className="astro-label">Salida del Sol</span>
                        <span className="astro-value">{formatearHora(astrosDias.sunrise[0])}</span>
                    </div>
                </div>

                {/* SOL: Puesta */}
                <div className="astro-card">
                    <div className="astro-icon-wrapper">
                        <img src={sunsetIcon} alt="Atardecer" />
                    </div>
                    <div className="astro-info">
                        <span className="astro-label">Puesta del Sol</span>
                        <span className="astro-value">{formatearHora(astrosDias.sunset[0])}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PanelAstronomico;