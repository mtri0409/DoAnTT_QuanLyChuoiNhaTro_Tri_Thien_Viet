package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.InvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceDetailRepo extends JpaRepository<InvoiceDetail, Long> {

    List<InvoiceDetail> findByInvoice_InvoiceId(Long invoiceId);

    void deleteByInvoice_InvoiceId(Long invoiceId);
}