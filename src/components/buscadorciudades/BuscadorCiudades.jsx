import React from 'react';
import './BuscadorCiudades.css';

function BuscadorCiudades({ terminoBusqueda, setTerminoBusqueda, listaOpciones, seleccionarCiudadManualmente }) {
    return (
        <div className="search-wrapper">
            <input
                type="text"
                className="search-input"
                placeholder="Buscar spots de viento..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
            {listaOpciones?.length > 0 && (
                <ul className="options-list">
                    {listaOpciones.map((opcion) => (
                        <li key={opcion.id}>
                            <button onClick={() => seleccionarCiudadManualmente(opcion)} className="option-btn">
                                {opcion.textoMostrar}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default BuscadorCiudades;