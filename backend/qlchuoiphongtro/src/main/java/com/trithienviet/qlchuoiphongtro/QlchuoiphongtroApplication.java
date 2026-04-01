package com.trithienviet.qlchuoiphongtro;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class QlchuoiphongtroApplication {

	public static void main(String[] args) {
		SpringApplication.run(QlchuoiphongtroApplication.class, args);
	}

	@Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

}
