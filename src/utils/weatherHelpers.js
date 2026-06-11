// src/utils/weatherHelpers.js

// Importamos los Meteocons desde su ubicación para que las funciones los tengan disponibles
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
import windIcon from '@meteocons/svg/fill/wind.svg';

export function obtenerIconoMeteocon(code, esDia) {
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

export function obtenerIconoViento() {
    return windIcon;
}

export function obtenerClaseViento(nudos) {
    if (nudos < 5) return 'wind-calm';
    if (nudos < 10) return 'wind-light';
    if (nudos < 15) return 'wind-moderate';
    if (nudos < 22) return 'wind-strong';
    if (nudos < 28) return 'wind-very-strong';
    return 'wind-gale';
}

export function obtenerClaseRafagas(nudos) {
    if (nudos < 5) return 'wind-calm';
    if (nudos < 10) return 'wind-light';
    if (nudos < 15) return 'wind-moderate';
    if (nudos < 22) return 'wind-strong';
    if (nudos < 28) return 'wind-very-strong';
    return 'wind-gale';
}

export function obtenerClaseTemperatura(temp) {
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

export function obtenerClaseHumedad(humedad) {
    if (humedad < 30) return 'humidity-low';
    if (humedad >= 30 && humedad < 60) return 'humidity-moderate';
    if (humedad >= 60) return 'humidity-high';
    return 'humidity-normal';
}

export function obtenerEtiquetaDia(date) {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${diasSemana[date.getDay()]} ${String(date.getDate()).padStart(2, '0')}`;
}

export function obtenerIconoLuna(fase) {
    // Escala de Open-Meteo: 0 a 1
    if (fase === 0 || fase === 1) return '@meteocons/svg/fill/moon-new.svg';
    if (fase > 0 && fase < 0.25) return '@meteocons/svg/fill/moon-waxing-crescent.svg';
    if (fase === 0.25) return '@meteocons/svg/fill/moon-first-quarter.svg';
    if (fase > 0.25 && fase < 0.5) return '@meteocons/svg/fill/moon-waxing-gibbous.svg';
    if (fase === 0.5) return '@meteocons/svg/fill/moon-full.svg';
    if (fase > 0.5 && fase < 0.75) return '@meteocons/svg/fill/moon-waning-gibbous.svg';
    if (fase === 0.75) return '@meteocons/svg/fill/moon-last-quarter.svg';
    return '@meteocons/svg/fill/moon-waning-crescent.svg';
}

// Podés mapear también los nombres en español para el diseño
export function obtenerNombreLuna(fase) {
    if (fase === 0 || fase === 1) return 'Luna Nueva';
    if (fase > 0 && fase < 0.25) return 'Luna Creciente';
    if (fase === 0.25) return 'Cuarto Creciente';
    if (fase > 0.25 && fase < 0.5) return 'Gibosa Creciente';
    if (fase === 0.5) return 'Luna Llena';
    if (fase > 0.5 && fase < 0.75) return 'Gibosa Menguante';
    if (fase === 0.75) return 'Cuarto Menguante';
    return 'Luna Menguante';
}