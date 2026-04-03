package com.trithienviet.qlchuoiphongtro.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trithienviet.qlchuoiphongtro.entity.Amenity;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.AmenityDTO;
import com.trithienviet.qlchuoiphongtro.repo.AmenityRepo;
import com.trithienviet.qlchuoiphongtro.service.AmenityService;

@Service
public class AmenityServiceImpl implements AmenityService {

    @Autowired
    private AmenityRepo amenityRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public PageResponse<AmenityDTO> getAllAmenities(
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder) {

        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<Amenity> page = amenityRepo.findAll(pageable);

        List<AmenityDTO> dtos = page.getContent().stream()
                .map(amenity -> modelMapper.map(amenity, AmenityDTO.class))
                .collect(Collectors.toList());

        PageResponse<AmenityDTO> response = new PageResponse<>();
        response.setContent(dtos);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLastPage(page.isLast());

        return response;
    }

    @Override
    public AmenityDTO getAmenityById(Integer amenityId) {
        Amenity amenity = amenityRepo.findById(amenityId)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity", "amenityId", amenityId.longValue()));

        return modelMapper.map(amenity, AmenityDTO.class);
    }

    @Override
    @Transactional
    public AmenityDTO createAmenity(AmenityDTO amenityDTO) {
        Amenity amenity = modelMapper.map(amenityDTO, Amenity.class);

        Amenity saved = amenityRepo.save(amenity);

        return modelMapper.map(saved, AmenityDTO.class);
    }

    @Override
    @Transactional
    public AmenityDTO updateAmenity(Integer amenityId, AmenityDTO amenityDTO) {
        Amenity amenity = amenityRepo.findById(amenityId)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity", "amenityId", amenityId.longValue()));

        amenity.setAmenityName(amenityDTO.getAmenityName());
        amenity.setIcon(amenityDTO.getIcon());

        Amenity updated = amenityRepo.save(amenity);

        return modelMapper.map(updated, AmenityDTO.class);
    }

    @Override
    @Transactional
    public String deleteAmenity(Integer amenityId) {
        Amenity amenity = amenityRepo.findById(amenityId)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity", "amenityId", amenityId.longValue()));

        amenityRepo.delete(amenity);

        return "Xóa tiện ích thành công với id: " + amenityId;
    }
}