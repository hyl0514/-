package org.example.traveljavaserver.controller;

import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/travel/weather")
public class WeatherController {

    // 模拟天气数据
    private static final Map<String, Map<String, Object>> weatherData = new HashMap<>();

    static {
        // 初始化各城市天气数据
        weatherData.put("北京", Map.of(
                "city", "北京",
                "temperature", "28",
                "weather", "晴",
                "icon", "☀️",
                "low", "22",
                "high", "30",
                "humidity", "45%",
                "wind", "东南风3级",
                "tips", "天气晴朗，适合出游"
        ));
        weatherData.put("上海", Map.of(
                "city", "上海",
                "temperature", "30",
                "weather", "多云",
                "icon", "⛅",
                "low", "24",
                "high", "32",
                "humidity", "65%",
                "wind", "东风2级",
                "tips", "多云天气，注意防晒"
        ));
        weatherData.put("广州", Map.of(
                "city", "广州",
                "temperature", "32",
                "weather", "雷阵雨",
                "icon", "⛈️",
                "low", "26",
                "high", "33",
                "humidity", "80%",
                "wind", "南风4级",
                "tips", "有雷雨天气，建议携带雨具"
        ));
        weatherData.put("深圳", Map.of(
                "city", "深圳",
                "temperature", "31",
                "weather", "多云转晴",
                "icon", "🌤️",
                "low", "25",
                "high", "33",
                "humidity", "70%",
                "wind", "东北风2级",
                "tips", "天气适宜，适合海边游玩"
        ));
        weatherData.put("成都", Map.of(
                "city", "成都",
                "temperature", "26",
                "weather", "阴",
                "icon", "☁️",
                "low", "22",
                "high", "28",
                "humidity", "75%",
                "wind", "北风1级",
                "tips", "阴天凉爽，适合逛吃"
        ));
        weatherData.put("杭州", Map.of(
                "city", "杭州",
                "temperature", "27",
                "weather", "小雨",
                "icon", "🌧️",
                "low", "23",
                "high", "29",
                "humidity", "85%",
                "wind", "西北风2级",
                "tips", "有小雨，西湖烟雨别有风味"
        ));
        weatherData.put("西安", Map.of(
                "city", "西安",
                "temperature", "34",
                "weather", "晴",
                "icon", "☀️",
                "low", "25",
                "high", "36",
                "humidity", "35%",
                "wind", "西南风3级",
                "tips", "天气炎热，注意防暑降温"
        ));
        weatherData.put("重庆", Map.of(
                "city", "重庆",
                "temperature", "36",
                "weather", "多云",
                "icon", "⛅",
                "low", "28",
                "high", "38",
                "humidity", "60%",
                "wind", "无风",
                "tips", "天气闷热，注意补水"
        ));
        weatherData.put("南京", Map.of(
                "city", "南京",
                "temperature", "29",
                "weather", "晴转多云",
                "icon", "🌤️",
                "low", "23",
                "high", "31",
                "humidity", "55%",
                "wind", "东南风2级",
                "tips", "天气舒适，适合出行"
        ));
        weatherData.put("武汉", Map.of(
                "city", "武汉",
                "temperature", "33",
                "weather", "晴",
                "icon", "☀️",
                "low", "26",
                "high", "35",
                "humidity", "50%",
                "wind", "南风3级",
                "tips", "天气炎热，黄鹤楼登高注意防晒"
        ));
        weatherData.put("苏州", Map.of(
                "city", "苏州",
                "temperature", "27",
                "weather", "多云",
                "icon", "⛅",
                "low", "22",
                "high", "29",
                "humidity", "70%",
                "wind", "东风2级",
                "tips", "天气宜人，适合园林游览"
        ));
        weatherData.put("长沙", Map.of(
                "city", "长沙",
                "temperature", "32",
                "weather", "阵雨",
                "icon", "🌦️",
                "low", "25",
                "high", "34",
                "humidity", "75%",
                "wind", "南风3级",
                "tips", "阵雨天气，出行携带雨伞"
        ));
        weatherData.put("天津", Map.of(
                "city", "天津",
                "temperature", "29",
                "weather", "晴",
                "icon", "☀️",
                "low", "22",
                "high", "31",
                "humidity", "45%",
                "wind", "东北风3级",
                "tips", "天气晴朗，适合海边漫步"
        ));
        weatherData.put("青岛", Map.of(
                "city", "青岛",
                "temperature", "25",
                "weather", "晴",
                "icon", "☀️",
                "low", "20",
                "high", "27",
                "humidity", "60%",
                "wind", "海风4级",
                "tips", "凉爽宜人，最佳旅游季节"
        ));
        weatherData.put("厦门", Map.of(
                "city", "厦门",
                "temperature", "28",
                "weather", "多云",
                "icon", "⛅",
                "low", "24",
                "high", "30",
                "humidity", "70%",
                "wind", "东北风3级",
                "tips", "海滨城市，气候舒适"
        ));
        weatherData.put("三亚", Map.of(
                "city", "三亚",
                "temperature", "30",
                "weather", "晴",
                "icon", "☀️",
                "low", "26",
                "high", "32",
                "humidity", "75%",
                "wind", "东北风2级",
                "tips", "阳光沙滩，注意防晒"
        ));
        weatherData.put("丽江", Map.of(
                "city", "丽江",
                "temperature", "22",
                "weather", "晴",
                "icon", "☀️",
                "low", "15",
                "high", "24",
                "humidity", "50%",
                "wind", "西南风2级",
                "tips", "高原气候，昼夜温差大"
        ));
        weatherData.put("大理", Map.of(
                "city", "大理",
                "temperature", "23",
                "weather", "多云",
                "icon", "⛅",
                "low", "16",
                "high", "25",
                "humidity", "55%",
                "wind", "西风3级",
                "tips", "气候宜人，适合骑行环洱海"
        ));
    }

    /**
     * 获取城市天气
     */
    @GetMapping("/get")
    public Result<Map<String, Object>> getWeather(@RequestParam String city) {
        Map<String, Object> weather = weatherData.get(city);
        if (weather != null) {
            return Result.ok(weather);
        }
        // 如果没有该城市数据，返回默认数据
        return Result.ok(Map.of(
                "city", city,
                "temperature", "25",
                "weather", "晴",
                "icon", "☀️",
                "low", "20",
                "high", "28",
                "humidity", "50%",
                "wind", "微风",
                "tips", "天气不错，适合出游"
        ));
    }

    /**
     * 获取多个城市天气
     */
    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getWeatherList(@RequestParam List<String> cities) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (String city : cities) {
            result.add(weatherData.getOrDefault(city, Map.of(
                    "city", city,
                    "temperature", "25",
                    "weather", "晴",
                    "icon", "☀️",
                    "low", "20",
                    "high", "28",
                    "humidity", "50%",
                    "wind", "微风",
                    "tips", "天气不错，适合出游"
            )));
        }
        return Result.ok(result);
    }

    /**
     * 获取热门城市天气
     */
    @GetMapping("/hot")
    public Result<List<Map<String, Object>>> getHotWeather() {
        List<String> hotCities = Arrays.asList("北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆");
        return getWeatherList(hotCities);
    }
}
