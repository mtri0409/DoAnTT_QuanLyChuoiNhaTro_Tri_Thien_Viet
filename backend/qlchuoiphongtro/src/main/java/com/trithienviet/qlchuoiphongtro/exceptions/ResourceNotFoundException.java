package com.trithienviet.qlchuoiphongtro.exceptions;

public class ResourceNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    String resourceName;
    String field;
    String fieldName;
    Long fieldId;
    Integer fieldIdInteger;

    public ResourceNotFoundException() {
    }

    public ResourceNotFoundException(String resourceName, String field, String fieldName) {
        super("%s không tìm thấy với %s: %s".formatted(resourceName, field, fieldName));
        this.resourceName = resourceName;
        this.field = field;
        this.fieldName = fieldName;
    }

    public ResourceNotFoundException(String resourceName, String field, Long fieldId) {
        super("%s không tìm thấy với %s: %d".formatted(resourceName, field, fieldId));
        this.resourceName = resourceName;
        this.field = field;
        this.fieldId = fieldId;
    }
    
    public ResourceNotFoundException(String resourceName, String field, Integer fieldIdInteger) {
        super("%s not found with %s: %d".formatted(resourceName, field, fieldIdInteger));
        this.resourceName = resourceName;
        this.field = field;
        this.fieldIdInteger = fieldIdInteger;
    }
}

    // public class ResourceNotFoundException extends RuntimeException {

    //     private String resourceName;
    //     private String fieldName;
    //     private Object fieldValue;

    //     public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
    //         super(String.format("%s not found with %s : '%s'",
    //                 resourceName, fieldName, fieldValue));
    //         this.resourceName = resourceName;
    //         this.fieldName = fieldName;
    //         this.fieldValue = fieldValue;
    //     }
    // }
