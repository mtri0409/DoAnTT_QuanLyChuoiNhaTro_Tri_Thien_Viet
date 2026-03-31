package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.trithienviet.qlchuoiphongtro.entity.OtpToken;

public interface OtpTokenRepo extends JpaRepository<OtpToken,Long> {
    @Query("SELECT t FROM OtpToken t WHERE t.user.userId = :userId ORDER BY t.otpId DESC LIMIT 1")
    Optional<OtpToken> findLatestTokenByUserId(@Param("userId") Long userId);
    List<OtpToken> findByUserUserId(Long userId);
}
