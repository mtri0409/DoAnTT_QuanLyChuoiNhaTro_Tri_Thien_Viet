package com.trithienviet.qlchuoiphongtro.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Branch;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.BranchDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.repo.BranchRepo;
import com.trithienviet.qlchuoiphongtro.service.BranchService;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.*;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BranchServiceImpl implements BranchService {

    @Autowired
    private BranchRepo branchRepo;

    @Autowired
    private ModelMapper modelMapper;

    // ✅ GET ALL
    @Override
    public PageResponse<BranchDTO> getAllBranches(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {

        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Branch> branchPage = branchRepo.findAll(pageDetails);

        List<Branch> branches = branchPage.getContent();

        List<BranchDTO> branchDTOs = branches.stream()
                .map(branch -> modelMapper.map(branch, BranchDTO.class))
                .collect(Collectors.toList());

        PageResponse<BranchDTO> response = new PageResponse<>();
        response.setContent(branchDTOs);
        response.setPageNumber(branchPage.getNumber());
        response.setPageSize(branchPage.getSize());
        response.setTotalElements(branchPage.getTotalElements());
        response.setTotalPages(branchPage.getTotalPages());
        response.setLastPage(branchPage.isLast());

        return response;
    }

    // ✅ GET BY ID
    @Override
    public BranchDTO getBranchById(Long id) {
        Branch branch = branchRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));

        return modelMapper.map(branch, BranchDTO.class);
    }

    // ✅ CREATE
    @Transactional
    @Override
    public BranchDTO createBranch(BranchDTO branchDTO) {
        Branch branch = modelMapper.map(branchDTO, Branch.class);

        Branch saved = branchRepo.save(branch);

        return modelMapper.map(saved, BranchDTO.class);
    }

    // ✅ UPDATE
    @Transactional
    @Override
    public BranchDTO updateBranch(Long id, BranchDTO branchDTO) {

        Branch branch = branchRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));

        branch.setBranchName(branchDTO.getBranchName());
        branch.setAddress(branchDTO.getAddress());

        Branch updated = branchRepo.save(branch);

        return modelMapper.map(updated, BranchDTO.class);
    }

    // ✅ DELETE
    @Transactional
    @Override
    public String deleteBranch(Long id) {
        Branch branch = branchRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));

        branchRepo.delete(branch);

        return "Xóa chi nhánh thành công với id: " + id;
    }
}