package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.AmenityDTO;

public interface AmenityService {
    PageResponse<AmenityDTO> getAllAmenities(
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder
    );

    AmenityDTO getAmenityById(Integer amenityId);

    AmenityDTO createAmenity(AmenityDTO amenityDTO);

    AmenityDTO updateAmenity(Integer amenityId, AmenityDTO amenityDTO);

    String deleteAmenity(Integer amenityId);
}