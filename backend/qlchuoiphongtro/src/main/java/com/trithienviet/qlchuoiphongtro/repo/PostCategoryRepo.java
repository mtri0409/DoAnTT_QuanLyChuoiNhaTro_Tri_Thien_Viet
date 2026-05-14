package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.PostCategory;

@Repository
public interface PostCategoryRepo extends JpaRepository<PostCategory, Integer> {

    boolean existsBySlug(String slug);

    boolean existsBySlugAndCategoryIdNot(String slug, Integer categoryId);

    Optional<PostCategory> findBySlug(String slug);

    List<PostCategory> findByActiveTrueOrderByDisplayOrderAsc();
}