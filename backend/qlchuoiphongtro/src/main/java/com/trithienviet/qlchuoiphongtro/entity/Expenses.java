package com.trithienviet.qlchuoiphongtro.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name="expenses")

public class Expenses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long expenseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="branch_id")
    private Branch branch;

    private String expenseCategory; // Tiền sửa chửa, lương ....

    private BigDecimal amount;

    private LocalDateTime paymentDate;
    private String payeeName;      // tên người/đơn vị nhận tiền (thợ, nhà cung cấp...)
    private String evidenceUrl;    // ảnh chứng từ, hóa đơn
    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="created_by")
    private User user;

}
