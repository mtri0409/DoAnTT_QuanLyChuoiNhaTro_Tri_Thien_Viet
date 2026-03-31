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
import com.trithienviet.qlchuoiphongtro.entity.ServiceItem;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ServiveDTO;
import com.trithienviet.qlchuoiphongtro.repo.ServiceRepo;
import com.trithienviet.qlchuoiphongtro.service.ServiceService;

@Service
public class ServiceServiceImpl implements ServiceService {

    @Autowired
    private ServiceRepo serviceRepo;

    @Autowired
    private ModelMapper modelMapper;

    // ✅ GET ALL
    @Override
    public PageResponse<ServiveDTO> getAllServices(Integer pageNumber, Integer pageSize, String sortBy,
            String sortOrder) {

        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<ServiceItem> servicePage = serviceRepo.findAll(pageDetails);

        List<ServiceItem> services = servicePage.getContent();

        List<ServiveDTO> serviceDTOs = services.stream()
                .map(service -> modelMapper.map(service, ServiveDTO.class))
                .collect(Collectors.toList());

        PageResponse<ServiveDTO> response = new PageResponse<>();
        response.setContent(serviceDTOs);
        response.setPageNumber(servicePage.getNumber());
        response.setPageSize(servicePage.getSize());
        response.setTotalElements(servicePage.getTotalElements());
        response.setTotalPages(servicePage.getTotalPages());
        response.setLastPage(servicePage.isLast());

        return response;
    }

    // ✅ GET BY ID
    @Override
    public ServiveDTO getServiceById(Integer id) {
        ServiceItem service = serviceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        return modelMapper.map(service, ServiveDTO.class);
    }

    // ✅ CREATE
    @Transactional
    @Override
    public ServiveDTO createService(ServiveDTO serviveDTO) {
        ServiceItem service = modelMapper.map(serviveDTO, ServiceItem.class);

        ServiceItem saved = serviceRepo.save(service);

        return modelMapper.map(saved, ServiveDTO.class);
    }

    // ✅ UPDATE
    @Transactional
    @Override
    public ServiveDTO updateService(Integer id, ServiveDTO serviveDTO) {

        ServiceItem service = serviceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        service.setServiceName(serviveDTO.getServiceName());
        service.setUnit(serviveDTO.getUnit());
        service.setPrice(serviveDTO.getPrice());
        service.setServiceType(serviveDTO.getServiceType());
        service.setIs_active(serviveDTO.getIs_active());

        ServiceItem updated = serviceRepo.save(service);

        return modelMapper.map(updated, ServiveDTO.class);
    }

    public class ResourceNotFoundException extends RuntimeException {

        private String resourceName;
        private String fieldName;
        private Object fieldValue;

        public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
            super(String.format("%s not found with %s : '%s'",
                    resourceName, fieldName, fieldValue));
            this.resourceName = resourceName;
            this.fieldName = fieldName;
            this.fieldValue = fieldValue;
        }
    }

    // ✅ DELETE
    @Transactional
    @Override
    public String deleteService(Integer id) {
        ServiceItem service = serviceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        serviceRepo.delete(service);

        return "Xóa dịch vụ thành công với id: " + id;
    }
}