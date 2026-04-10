package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
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
        List<Invoice> findByStatus(String status);
        List<Invoice> findByStatusAndPeriodMonthAndPeriodYear(String status, int month, int year);
       @Query("SELECT i FROM Invoice i " +
       "JOIN FETCH i.contract c " +
       "JOIN FETCH c.roomMembers rm " +
       "JOIN FETCH rm.profile p " +
       "WHERE i.status = :status AND i.dueDate < :date")
        List<Invoice> findOverdueInvoices(
                @Param("status") String status, 
                @Param("date") LocalDate date
        );       
}