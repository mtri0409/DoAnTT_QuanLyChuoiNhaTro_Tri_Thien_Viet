package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.Room;

@Repository
public interface RoomRepo extends JpaRepository<Room, Long> {
}
