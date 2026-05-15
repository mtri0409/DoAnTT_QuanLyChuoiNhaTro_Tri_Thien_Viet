package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostImageDTO {

    private Integer imageId;
    private String imageUrl;
    private String altText;
    private Integer displayOrder;
    private Boolean isPrimary;
}