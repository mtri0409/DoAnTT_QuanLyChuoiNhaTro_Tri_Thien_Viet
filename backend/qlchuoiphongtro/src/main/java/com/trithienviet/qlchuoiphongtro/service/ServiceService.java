package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ServiveDTO;

public interface ServiceService {

    PageResponse<ServiveDTO> getAllServices(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    ServiveDTO getServiceById(Integer serviceId);

    ServiveDTO createService(ServiveDTO serviveDTO);

    ServiveDTO updateService(Integer serviceId, ServiveDTO serviveDTO);

    String deleteService(Integer serviceId);
}