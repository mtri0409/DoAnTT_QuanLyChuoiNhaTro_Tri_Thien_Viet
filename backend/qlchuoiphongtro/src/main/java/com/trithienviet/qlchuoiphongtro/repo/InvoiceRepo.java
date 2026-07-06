package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.Invoice;
import com.trithienviet.qlchuoiphongtro.payloads.FinancialProjection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface InvoiceRepo extends JpaRepository<Invoice, Long> {

        List<Invoice> findByContract_ContractId(Long contractId);

        Page<Invoice> findByContract_ContractId(Long contractId, Pageable pageable);

        // Kiểm tra trùng kỳ cho MONTHLY (1 hợp đồng chỉ có 1 hóa đơn MONTHLY / kỳ)
        boolean existsByContract_ContractIdAndTypeAndPeriodMonthAndPeriodYear(
                        Long contractId, String type, Integer month, Integer year);

        Page<Invoice> findByStatus(String status, Pageable pageable);

        Optional<Invoice> findByContract_ContractIdAndTypeAndPeriodMonthAndPeriodYear(
                        Long contractId, String type, Integer month, Integer year);

        List<Invoice> findByContract_ContractIdAndStatus(Long contractId, String status);

        List<Invoice> findByStatusAndPeriodMonthAndPeriodYear(
                        String status, Integer month, Integer year);

        // Lấy hóa đơn deposit của 1 hợp đồng (thường chỉ có 1)
        Optional<Invoice> findByContract_ContractIdAndType(Long contractId, String type);

        @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.details WHERE i.invoiceId = :id")
        Optional<Invoice> findByIdWithDetails(@Param("id") Long id);

        /**
         * Lọc đa tiêu chí — bổ sung param type.
         * Truyền null để bỏ qua điều kiện tương ứng.
         */
        @Query("SELECT i FROM Invoice i " +
                        "JOIN i.contract c " +
                        "JOIN c.room r " +
                        "JOIN r.floor f " +
                        "JOIN f.branch b " +
                        "WHERE (:status   IS NULL OR i.status      = :status) " +
                        "AND   (:type     IS NULL OR i.type        = :type) " +
                        "AND   (:month    IS NULL OR i.periodMonth = :month) " +
                        "AND   (:year     IS NULL OR i.periodYear  = :year) " +
                        "AND   (:contractId IS NULL OR c.contractId = :contractId) " +
                        "AND   (:branchId   IS NULL OR b.branchId   = :branchId)")
        Page<Invoice> filterInvoices(
                        @Param("status") String status,
                        @Param("type") String type,
                        @Param("month") Integer month,
                        @Param("year") Integer year,
                        @Param("contractId") Long contractId,
                        @Param("branchId") Long branchId,
                        Pageable pageable);

        @Query("SELECT i FROM Invoice i WHERE i.contract.contractId IN :contractIds " +
                        "AND (:status IS NULL OR i.status = :status) " +
                        "AND (:type IS NULL OR i.type = :type) " +
                        "AND (:month IS NULL OR i.periodMonth = :month) " +
                        "AND (:year IS NULL OR i.periodYear = :year)")
        Page<Invoice> filterByContractIds(
                        @Param("contractIds") List<Long> contractIds,
                        @Param("status") String status,
                        @Param("type") String type,
                        @Param("month") Integer month,
                        @Param("year") Integer year,
                        Pageable pageable);

        // Query dành cho tab "Tất cả" — lấy mọi status trừ DRAFT
        @Query("SELECT i FROM Invoice i WHERE i.contract.contractId IN :contractIds " +
                        "AND i.status <> 'DRAFT' " +
                        "AND (:type IS NULL OR i.type = :type) " +
                        "AND (:month IS NULL OR i.periodMonth = :month) " +
                        "AND (:year IS NULL OR i.periodYear = :year)")
        Page<Invoice> filterByContractIdsExcludeDraft(
                        @Param("contractIds") List<Long> contractIds,
                        @Param("type") String type,
                        @Param("month") Integer month,
                        @Param("year") Integer year,
                        Pageable pageable);

        List<Invoice> findByStatus(String status);

        List<Invoice> findByStatusAndPeriodMonthAndPeriodYear(String status, int month, int year);

        @Query("SELECT i FROM Invoice i " +
                        "JOIN FETCH i.contract c " +
                        "JOIN FETCH c.roomMembers rm " +
                        "JOIN FETCH rm.profile p " +
                        "WHERE i.status = :status AND i.dueDate < :date")
        List<Invoice> findOverdueInvoices(
                        @Param("status") String status,
                        @Param("date") LocalDate date);

        @Query("SELECT " +
                        "COALESCE(SUM(CASE WHEN i.type = 'MONTHLY' AND i.status = 'PAID' THEN i.totalAmount ELSE 0 END), 0) as totalPaidMonthly, "
                        +
                        "COALESCE(SUM(CASE WHEN i.type = 'DEPOSIT' THEN i.paidAmount ELSE 0 END), 0) as totalPaidDeposit, "
                        +
                        "COALESCE(SUM(CASE WHEN i.status = 'REFUNDED' THEN i.totalAmount ELSE 0 END), 0) as totalRefunded, "
                        +
                        "COALESCE(SUM(CASE WHEN i.status IN ('PENDING', 'PARTIAL') THEN (i.totalAmount - COALESCE(i.paidAmount, 0)) ELSE 0 END), 0) as totalPending, "
                        +
                        "COUNT(CASE WHEN i.status = 'PAID' THEN 1 END) as paidCount, " +
                        "COUNT(CASE WHEN i.status IN ('PENDING', 'PARTIAL') THEN 1 END) as pendingCount " +
                        "FROM Invoice i " +
                        "WHERE (:branchId IS NULL OR i.contract.room.floor.branch.branchId = :branchId)")
        FinancialProjection getFinancialStatsInterface(@Param("branchId") Long branchId);

        @Query("SELECT " +
                        "COALESCE(SUM(CASE WHEN i.type = 'MONTHLY' AND i.status = 'PAID' THEN i.totalAmount ELSE 0 END), 0) as totalPaidMonthly, "
                        +
                        "COALESCE(SUM(CASE WHEN i.type = 'DEPOSIT' THEN i.paidAmount ELSE 0 END), 0) as totalPaidDeposit, "
                        +
                        "COALESCE(SUM(CASE WHEN i.status = 'REFUNDED' THEN i.totalAmount ELSE 0 END), 0) as totalRefunded, "
                        +
                        "COALESCE(SUM(CASE WHEN i.status IN ('PENDING', 'PARTIAL') THEN (i.totalAmount - COALESCE(i.paidAmount, 0)) ELSE 0 END), 0) as totalPending, "
                        +
                        "COUNT(CASE WHEN i.status = 'PAID' THEN 1 END) as paidCount, " +
                        "COUNT(CASE WHEN i.status IN ('PENDING', 'PARTIAL') THEN 1 END) as pendingCount " +
                        "FROM Invoice i " +
                        "WHERE (:branchId IS NULL OR i.contract.room.floor.branch.branchId = :branchId) " +
                        "AND (:month IS NULL OR i.periodMonth = :month) " +
                        "AND (:year IS NULL OR i.periodYear = :year)")
        FinancialProjection getFinancialStats(
                        @Param("branchId") Long branchId,
                        @Param("month") Integer month,
                        @Param("year") Integer year);

        @Query("SELECT i FROM Invoice i " +
                        "WHERE i.status IN ('PENDING', 'PARTIAL') " +
                        "AND (:branchId IS NULL OR i.contract.room.floor.branch.branchId = :branchId) " +
                        "ORDER BY i.dueDate ASC")
        List<Invoice> findTopPendingInvoices(
                        @Param("branchId") Long branchId,
                        Pageable pageable);

        @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.details " +
                        "WHERE i.contract.contractId IN :contractIds " +
                        "AND (:status IS NULL OR i.status = :status) " +
                        "AND (:type IS NULL OR i.type = :type) " +
                        "AND (:month IS NULL OR i.periodMonth = :month) " +
                        "AND (:year IS NULL OR i.periodYear = :year)")
        List<Invoice> filterByContractIdsWithDetails(
                        @Param("contractIds") List<Long> contractIds,
                        @Param("status") String status,
                        @Param("type") String type,
                        @Param("month") Integer month,
                        @Param("year") Integer year);

        /**
         * Query 1: Danh sách cư dân có hóa đơn tháng quá hạn và còn nợ.
         * Chỉ lấy ngườ đại diện của hợp đồng (contracts.representative_id) để tránh
         * lặp hóa đơn khi một phòng có nhiều thành viên.
         * @param branchName (Optional) Tên chi nhánh để lọc
         * @param month (Optional) Tháng để lọc
         * @param year (Optional) Năm để lọc
         * Trả về: Tên khách thuê, SĐT, Chi nhánh, Tên phòng, Mã hóa đơn, Số tiền nợ, Hạn nộp
         */
        @Query(value = """
            SELECT
                p.full_name AS tenant_name,
                p.phone AS tenant_phone,
                b.branch_name AS branch_name,
                r.room_name AS room_name,
                i.invoice_id AS invoice_id,
                i.total_amount - COALESCE(pay.amount, 0) AS debt_amount,
                i.due_date AS due_date
            FROM
                invoices i
            JOIN
                contracts c ON i.contract_id = c.contract_id
            JOIN
                rooms r ON c.room_id = r.room_id
            JOIN
                floors f ON r.floor_id = f.floor_id
            JOIN
                branches b ON f.branch_id = b.branch_id
            JOIN
                profiles p ON c.representative_id = p.profile_id
            LEFT JOIN
                payments pay ON i.invoice_id = pay.invoice_id AND pay.status = 'SUCCESS'
            WHERE
                i.status IN ('PENDING', 'PARTIAL')
                AND i.type = 'MONTHLY'
                AND (i.total_amount - COALESCE(pay.amount, 0)) > 0
                AND (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%')))
                AND (:month IS NULL OR i.period_month = :month)
                AND (:year IS NULL OR i.period_year = :year)
            ORDER BY
                i.due_date ASC, b.branch_name ASC, r.room_name ASC
            """, nativeQuery = true)
        List<Map<String, Object>> findDebtorsList(
            @Param("branchName") String branchName,
            @Param("month") Integer month,
            @Param("year") Integer year
        );

        /**
         * Query 2: Thống kê doanh thu theo chi nhánh, tháng, năm
         * JOIN: payments → invoices → contracts → rooms → floors → branches
         * @param branchName (Optional) Tên chi nhánh để lọc
         * @param month (Optional) Tháng để lọc
         * @param year (Optional) Năm để lọc
         */
        @Query(value = """
            SELECT
                b.branch_name AS branch_name,
                MONTH(i.created_at) AS period_month,
                YEAR(i.created_at) AS period_year,
                SUM(pay.amount) AS total_revenue,
                COUNT(DISTINCT i.invoice_id) AS invoice_count
            FROM
                payments pay
            JOIN
                invoices i ON pay.invoice_id = i.invoice_id
            JOIN
                contracts c ON i.contract_id = c.contract_id
            JOIN
                rooms r ON c.room_id = r.room_id
            JOIN
                floors f ON r.floor_id = f.floor_id
            JOIN
                branches b ON f.branch_id = b.branch_id
            WHERE
                pay.status = 'PAID'
                AND (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%')))
                AND (:month IS NULL OR MONTH(i.created_at) = :month)
                AND (:year IS NULL OR YEAR(i.created_at) = :year)
            GROUP BY
                b.branch_name, MONTH(i.created_at), YEAR(i.created_at)
            ORDER BY
                YEAR(i.created_at) DESC, MONTH(i.created_at) DESC, b.branch_name
            """, nativeQuery = true)
        List<Map<String, Object>> findRevenueStats(
            @Param("branchName") String branchName,
            @Param("month") Integer month,
            @Param("year") Integer year
        );

        /**
         * Query 3: Thống kê tình trạng phòng (trống/đã thuê)
         * @param branchName (Optional) Tên chi nhánh để lọc
         */
        @Query(value = """
            SELECT
                b.branch_name AS branch_name,
                r.status AS room_status,
                COUNT(r.room_id) AS room_count
            FROM
                rooms r
            JOIN
                floors f ON r.floor_id = f.floor_id
            JOIN
                branches b ON f.branch_id = b.branch_id
            WHERE
                (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%')))
            GROUP BY
                b.branch_name, r.status
            """, nativeQuery = true)
        List<Map<String, Object>> findRoomStatusStats(@Param("branchName") String branchName);

        /**
         * Query 4: Thống kê số lượng người ở (room_members) theo chi nhánh
         * @param branchName (Optional) Tên chi nhánh để lọc
         */
        @Query(value = """
            SELECT
                b.branch_name AS branch_name,
                COUNT(rm.member_id) AS tenant_count
            FROM
                room_members rm
            JOIN
                contracts c ON rm.contract_id = c.contract_id
            JOIN
                rooms r ON c.room_id = r.room_id
            JOIN
                floors f ON r.floor_id = f.floor_id
            JOIN
                branches b ON f.branch_id = b.branch_id
            WHERE
                rm.is_staying = true
                AND c.status = 'ACTIVE'
                AND (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%')))
            GROUP BY
                b.branch_name
            """, nativeQuery = true)
        List<Map<String, Object>> findTenantCountStats(@Param("branchName") String branchName);

        /**
         * Query 5: Liệt kê chi tiết danh sách các phòng trống (AVAILABLE)
         * @param branchName (Optional) Tên chi nhánh để lọc
         */
        @Query(value = """
            SELECT
                b.branch_name AS branch_name,
                f.floor_number AS floor_name,
                r.room_name AS room_name,
                r.price AS price,
                r.max_people AS max_people
            FROM
                rooms r
            JOIN
                floors f ON r.floor_id = f.floor_id
            JOIN
                branches b ON f.branch_id = b.branch_id
            WHERE
                r.status = 'AVAILABLE'
                AND (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%')))
            ORDER BY
                b.branch_name ASC, f.floor_number ASC, r.room_name ASC
            """, nativeQuery = true)
        List<Map<String, Object>> findVacantRoomsList(@Param("branchName") String branchName);
}