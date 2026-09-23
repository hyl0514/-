package org.example.traveljavaserver.service;

import org.example.traveljavaserver.vo.FavoriteVO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FavoriteService {

    // 使用内存存储收藏数据，key为城市名+天数作为唯一标识
    private final ConcurrentHashMap<String, FavoriteVO> favorites = new ConcurrentHashMap<>();
    private Long nextId = 1L;

    /**
     * 添加收藏
     */
    public FavoriteVO addFavorite(FavoriteVO travel) {
        String key = generateKey(travel.getCity(), travel.getDays());
        
        // 如果已存在，更新时间
        if (favorites.containsKey(key)) {
            FavoriteVO existing = favorites.get(key);
            existing.setCreatedAt(LocalDateTime.now());
            return existing;
        }

        FavoriteVO favorite = FavoriteVO.builder()
                .id(nextId++)
                .city(travel.getCity())
                .days(travel.getDays())
                .totalBudget(travel.getTotalBudget())
                .description(travel.getCity() + " · " + travel.getDays() + "天旅游规划")
                .createdAt(LocalDateTime.now())
                .build();

        favorites.put(key, favorite);
        return favorite;
    }

    /**
     * 删除收藏
     */
    public boolean removeFavorite(String city, Integer days) {
        String key = generateKey(city, days);
        return favorites.remove(key) != null;
    }

    /**
     * 检查是否已收藏
     */
    public boolean isFavorite(String city, Integer days) {
        String key = generateKey(city, days);
        return favorites.containsKey(key);
    }

    /**
     * 获取所有收藏
     */
    public List<FavoriteVO> getAllFavorites() {
        List<FavoriteVO> result = new ArrayList<>(favorites.values());
        // 按创建时间倒序
        result.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return result;
    }

    /**
     * 获取收藏数量
     */
    public int getFavoriteCount() {
        return favorites.size();
    }

    /**
     * 生成唯一键
     */
    private String generateKey(String city, Integer days) {
        return city + "_" + days;
    }
}
