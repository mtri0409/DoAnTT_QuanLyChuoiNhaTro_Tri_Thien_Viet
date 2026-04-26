package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.Expenses;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpensesRepo extends JpaRepository<Expenses, Long> {

    Page<Expenses> findByBranch_BranchId(Integer branchId, Pageable pageable);

    Page<Expenses> findByPayer(String payer, Pageable pageable);

    Page<Expenses> findByExpenseCategory(String category, Pageable pageable);

    Page<Expenses> findByBranch_BranchIdAndPayer(Integer branchId, String payer, Pageable pageable);

    Page<Expenses> findByBranch_BranchIdAndExpenseCategory(
            Integer branchId, String category, Pageable pageable);

    /** Lọc đa tiêu chí */
    @Query("SELECT e FROM Expenses e " +
            "LEFT JOIN e.branch b " +
            "WHERE (:branchId IS NULL OR b.branchId = :branchId) " +
            "AND   (:payer IS NULL OR e.payer = :payer) " +
            "AND   (:category IS NULL OR e.expenseCategory = :category) " +
            "AND   (:from IS NULL OR e.paymentDate >= :from) " +
            "AND   (:to   IS NULL OR e.paymentDate <= :to)")
    Page<Expenses> filterExpenses(
            @Param("branchId") Integer branchId,
            @Param("payer") String payer,
            @Param("category") String category,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    /** Tổng chi phí OWNER_COST theo chi nhánh trong khoảng thời gian */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expenses e " +
            "WHERE e.payer = 'OWNER_COST' " +
            "AND (:branchId IS NULL OR e.branch.branchId = :branchId) " +
            "AND (:from IS NULL OR e.paymentDate >= :from) " +
            "AND (:to   IS NULL OR e.paymentDate <= :to)")
    BigDecimal sumOwnerCost(
            @Param("branchId") Integer branchId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    /** Tổng chi phí TENANT_FAULT (khoản phải thu từ khách) */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expenses e " +
            "WHERE e.payer = 'TENANT_FAULT' " +
            "AND (:branchId IS NULL OR e.branch.branchId = :branchId)")
    BigDecimal sumTenantFault(@Param("branchId") Integer branchId);

    List<Expenses> findByMaintenanceRequest_RequestId(Integer requestId);
}