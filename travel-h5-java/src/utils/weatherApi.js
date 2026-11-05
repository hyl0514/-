import { get } from './request'

// 获取城市天气
export function getWeather(city) {
    return get('travel/weather/get', { city })
}

// 获取热门城市天气
export function getHotWeather() {
    return get('travel/weather/hot')
}

// 获取多个城市天气
export function getWeatherList(cities) {
    return get('travel/weather/list', { cities: cities.join(',') })
}
