package org.example.traveljavaserver.controller;

import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * 排行榜（占位，后续接入 rank_items 表）
 */
@RestController
@RequestMapping("/api/ranks")
public class RankingController {

    @GetMapping
    public Result<List<Object>> ranks(@CurrentUser LoginUser me,
                                      @RequestParam(required = false, defaultValue = "spot") String type) {
        return Result.ok(Collections.emptyList());
    }
}
