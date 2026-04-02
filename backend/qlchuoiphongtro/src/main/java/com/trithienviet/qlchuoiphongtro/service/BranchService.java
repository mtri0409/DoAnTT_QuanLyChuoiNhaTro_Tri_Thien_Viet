package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.BranchDTO;

public interface BranchService {

    PageResponse<BranchDTO> getAllBranches(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    BranchDTO getBranchById(Long branchId);

    BranchDTO createBranch(BranchDTO branchDTO);

    BranchDTO updateBranch(Long branchId, BranchDTO branchDTO);

    String deleteBranch(Long branchId);
}