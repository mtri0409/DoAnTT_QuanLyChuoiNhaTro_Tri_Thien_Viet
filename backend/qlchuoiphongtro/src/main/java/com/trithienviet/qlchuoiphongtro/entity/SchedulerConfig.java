package com.trithienviet.qlchuoiphongtro.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scheduler_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchedulerConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "code_key", nullable = false, unique = true)
    private String codeKey;

    @Column(name = "cron_expression", nullable = false)
    private String cronExpression;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String description;
}
