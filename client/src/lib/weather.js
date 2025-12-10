export const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Light snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

export function getWeatherDescription(code) {
  return weatherCodes[code] || 'Unknown';
}

export function getWeatherIcon(code) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2 || code === 3) return '⛅';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌤️';
}

export function getTempColor(temp) {
  if (temp >= 30) return 'text-red-500';
  if (temp >= 20) return 'text-orange-500';
  if (temp >= 10) return 'text-yellow-600';
  return 'text-blue-500';
}
