package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.trithienviet.qlchuoiphongtro.entity.RoomMedia;
import java.util.List;

@Repository
public interface RoomMediaRepo extends JpaRepository<RoomMedia, Integer> {
    List<RoomMedia> findByRoom_RoomId(Integer roomId);
}