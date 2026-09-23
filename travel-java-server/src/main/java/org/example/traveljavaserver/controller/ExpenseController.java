package org.example.traveljavaserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.entity.ExpenseBill;
import org.example.traveljavaserver.mapper.ExpenseBillMapper;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 账单管理 —— 需 JWT
 */
@RestController
@RequestMapping("/api/bills")
public class ExpenseController {

    private final ExpenseBillMapper billMapper;

    public ExpenseController(ExpenseBillMapper billMapper) {
        this.billMapper = billMapper;
    }

    @GetMapping
    public Result<List<ExpenseBill>> list(@CurrentUser LoginUser me,
                                          @RequestParam(required = false) Long tripId) {
        LambdaQueryWrapper<ExpenseBill> q = new LambdaQueryWrapper<>();
        q.eq(ExpenseBill::getUserId, me.userId());
        if (tripId != null) q.eq(ExpenseBill::getTripId, tripId);
        q.orderByDesc(ExpenseBill::getBillDate);
        return Result.ok(billMapper.selectList(q));
    }

    @PostMapping
    public Result<ExpenseBill> create(@CurrentUser LoginUser me,
                                      @RequestBody ExpenseBill bill) {
        bill.setId(null);
        bill.setUserId(me.userId());
        bill.setCreatedAt(LocalDateTime.now());
        billMapper.insert(bill);
        return Result.ok(bill);
    }

    @PutMapping("/{id}")
    public Result<ExpenseBill> update(@CurrentUser LoginUser me,
                                      @PathVariable Long id,
                                      @RequestBody ExpenseBill bill) {
        ExpenseBill exist = billMapper.selectOne(
                new LambdaQueryWrapper<ExpenseBill>().eq(ExpenseBill::getId, id)
                        .eq(ExpenseBill::getUserId, me.userId())
        );
        if (exist == null) return Result.fail(404, "账单不存在");
        bill.setId(id);
        bill.setUserId(me.userId());
        billMapper.updateById(bill);
        return Result.ok(bill);
    }

    @DeleteMapping("/{id}")
    public Result<Object> delete(@CurrentUser LoginUser me, @PathVariable Long id) {
        ExpenseBill exist = billMapper.selectOne(
                new LambdaQueryWrapper<ExpenseBill>().eq(ExpenseBill::getId, id)
                        .eq(ExpenseBill::getUserId, me.userId())
        );
        if (exist == null) return Result.fail(404, "账单不存在");
        billMapper.deleteById(id);
        return Result.ok();
    }
}
