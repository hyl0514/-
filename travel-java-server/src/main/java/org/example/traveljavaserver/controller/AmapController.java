package org.example.traveljavaserver.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.example.traveljavaserver.vo.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 高德地图 Web 服务 API 代理（后端调用，避免前端跨域 + 前端 Key 类型不匹配问题）
 *
 * 为什么要后端代理：
 *   高德 Web 服务 API（restapi.amap.com）只接受「Web 服务」类型的 Key，
 *   前端加载地图用的是「Web端(JS API)」类型的 Key，两者不通用。
 *   所以 IP 定位、地理编码、逆地理编码必须由后端调用。
 */
@RestController
@RequestMapping("/api/amap")
public class AmapController {

    @Value("${amap.web-service-key:}")
    private String webServiceKey;

    @Value("${amap.rest-base:https://restapi.amap.com/v3}")
    private String restBase;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(6, TimeUnit.SECONDS)
            .readTimeout(8, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    private boolean keyConfigured() {
        return webServiceKey != null && !webServiceKey.isBlank() && !webServiceKey.startsWith("#");
    }

    /**
     * IP 定位 —— 后端用 ipinfo.io 查（高德移动 IP 数据库不全，查不到东莞移动）
     * 前端不用查公网 IP，后端跑在用户本机，出口 IP 就是真实 IP
     * 返回格式: { ip, lng, lat, province, city, address, source: "ipinfo" }
     */
    @GetMapping("/ip-location")
    public Result<Map<String, Object>> ipLocation() {
        // 先试 ipinfo.io（免费、不用 Key、移动 IP 覆盖全）
        try {
            String body = httpGet("https://ipinfo.io/json");
            JsonNode root = mapper.readTree(body);
            String ip = root.path("ip").asText("");
            String loc = root.path("loc").asText(""); // "lat,lng"
            String region = root.path("region").asText("");
            String city = root.path("city").asText("");
            double lng = 0, lat = 0;
            if (!loc.isBlank()) {
                String[] parts = loc.split(",");
                if (parts.length == 2) {
                    lat = Double.parseDouble(parts[0].trim());
                    lng = Double.parseDouble(parts[1].trim());
                }
            }
            Map<String, Object> result = new java.util.LinkedHashMap<>();
            result.put("ip", ip);
            result.put("lng", lng);
            result.put("lat", lat);
            result.put("province", region);
            result.put("city", city);
            result.put("address", (region + city).isBlank() ? "未知位置" : region + city);
            result.put("source", "ipinfo");
            return Result.ok(result);
        } catch (Exception e) {
            // ipinfo 也失败了，降级到高德（虽然高德查不到移动 IP，至少返回点东西）
            if (keyConfigured()) {
                try {
                    String body = httpGet(restBase + "/ip?key=" + webServiceKey + "&output=JSON");
                    JsonNode root = mapper.readTree(body);
                    if ("1".equals(root.path("status").asText())) {
                        Map<String, Object> result = new java.util.LinkedHashMap<>();
                        result.put("ip", "");
                        result.put("province", root.path("province").asText(""));
                        result.put("city", root.path("city").asText(""));
                        String rect = root.path("rectangle").asText("");
                        double lng = 116.4074, lat = 39.9042;
                        if (!rect.isBlank() && rect.contains(";")) {
                            String[] corners = rect.split(";");
                            String[] sw = corners[0].split(",");
                            String[] ne = corners[1].split(",");
                            lng = (Double.parseDouble(sw[0]) + Double.parseDouble(ne[0])) / 2;
                            lat = (Double.parseDouble(sw[1]) + Double.parseDouble(ne[1])) / 2;
                        }
                        result.put("lng", lng);
                        result.put("lat", lat);
                        String prov = (String) result.getOrDefault("province", "");
                        String cit = (String) result.getOrDefault("city", "");
                        result.put("address", prov + cit);
                        result.put("source", "amap");
                        return Result.ok(result);
                    }
                } catch (Exception ignored) { }
            }
            return Result.fail(502, "IP 定位服务全部不可用");
        }
    }

    /** 地理编码：地址 → 经纬度 */
    /** 地理编码：地址 → 经纬度；POI/餐馆名查不到时降级用 /v3/place/text POI 搜索 */
    @GetMapping("/geocode")
    public Result<Map<String, Object>> geocode(@RequestParam String address,
                                               @RequestParam(required = false) String city) {
        if (!keyConfigured()) {
            return Result.fail(503, "高德 Web 服务 Key 未配置");
        }
        // 第 1 步：标准地理编码
        try {
            String url = restBase + "/geocode/geo?key=" + webServiceKey
                    + "&address=" + urlEncode(address)
                    + (city != null && !city.isBlank() ? "&city=" + urlEncode(city) : "")
                    + "&output=JSON";
            String body = httpGet(url);
            JsonNode root = mapper.readTree(body);
            if ("1".equals(root.path("status").asText()) && root.path("geocodes").size() > 0) {
                return Result.ok(toMap(root));
            }
            // 第 2 步：降级 —— POI 文本搜索（/v3/place/text），能搜餐馆/景点名
            String placeUrl = restBase + "/place/text?key=" + webServiceKey
                    + "&keywords=" + urlEncode(address)
                    + (city != null && !city.isBlank() ? "&city=" + urlEncode(city) : "")
                    + "&offset=1&output=JSON";
            String placeBody = httpGet(placeUrl);
            JsonNode placeRoot = mapper.readTree(placeBody);
            if ("1".equals(placeRoot.path("status").asText())
                    && placeRoot.path("pois").size() > 0) {
                JsonNode poi = placeRoot.path("pois").get(0);
                Map<String, Object> result = new java.util.LinkedHashMap<>();
                result.put("formatted_address", poi.path("address").asText("") + " " + poi.path("name").asText(address));
                result.put("location", poi.path("location").asText("")); // "lng,lat"
                result.put("source", "poi-fallback");
                return Result.ok(result);
            }
            // 第 3 步：都查不到，返回空（让前端自己降级，不要 400 崩掉）
            Map<String, Object> empty = new java.util.LinkedHashMap<>();
            empty.put("formatted_address", address);
            empty.put("location", "");
            empty.put("source", "empty");
            return Result.ok(empty);
        } catch (Exception e) {
            return Result.ok(Map.of("formatted_address", address, "location", "", "source", "error"));
        }
    }

    /** 逆地理编码：经纬度 → 地址 */
    @GetMapping("/regeocode")
    public Result<Map<String, Object>> regeocode(@RequestParam double lng,
                                                 @RequestParam double lat) {
        if (!keyConfigured()) {
            return Result.fail(503, "高德 Web 服务 Key 未配置");
        }
        String url = restBase + "/geocode/regeo?key=" + webServiceKey
                + "&location=" + lng + "," + lat
                + "&extensions=base&output=JSON";
        try {
            String body = httpGet(url);
            JsonNode root = mapper.readTree(body);
            if ("1".equals(root.path("status").asText())) {
                return Result.ok(toMap(root));
            }
            return Result.fail(400, "逆地理编码失败: " + root.path("info").asText());
        } catch (Exception e) {
            return Result.fail(502, "逆地理编码调用失败: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(JsonNode node) throws Exception {
        return mapper.convertValue(node, Map.class);
    }

    private String httpGet(String url) throws Exception {
        Request request = new Request.Builder().url(url).get().build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("HTTP " + response.code());
            }
            return response.body().string();
        }
    }

    private String urlEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
