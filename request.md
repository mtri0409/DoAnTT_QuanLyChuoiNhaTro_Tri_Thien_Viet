Tôi muốn rollback toàn bộ phần refactor API Response mới và quay về cách triển khai cũ của dự án.

Hiện tại dự án đang sử dụng:

* ApiResponse<T>
* ApiResponse.success(...)
* ApiResponse.error(...)
* Controller trả về ResponseEntity<ApiResponse<T>>
* GlobalExceptionHandler trả về ApiResponse

Tôi muốn chuyển toàn bộ về chuẩn cũ đơn giản hơn như các file BranchController, APIResponse và MyGlobalExceptionHandler dưới đây.

Yêu cầu:

1. Loại bỏ việc sử dụng ApiResponse<T> mới trong tất cả controller.

Hiện tại:

```java
ResponseEntity<ApiResponse<BranchDTO>>
ResponseEntity<ApiResponse<PageResponse<BranchDTO>>>
```

Cần chuyển lại thành:

```java
ResponseEntity<BranchDTO>
ResponseEntity<PageResponse<BranchDTO>>
ResponseEntity<String>
```

giống phong cách:

```java
return new ResponseEntity<>(savedBranch, HttpStatus.CREATED);
return new ResponseEntity<>(response, HttpStatus.OK);
return new ResponseEntity<>(message, HttpStatus.OK);
```

2. Khôi phục lại class APIResponse cũ:

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class APIResponse {
    private String message;
    private boolean status;
}
```

3. Sửa MyGlobalExceptionHandler để sử dụng APIResponse cũ thay vì ApiResponse<T>.

Ví dụ:

```java
APIResponse res = new APIResponse(message, false);
return new ResponseEntity<>(res, HttpStatus.BAD_REQUEST);
```

4. Đảm bảo các exception nghiệp vụ như:

```java
throw new RuntimeException("No PENDING deposit found for room: 3");
throw new IllegalArgumentException("Room is not available");
throw new APIException("...");
```

được trả message trực tiếp về frontend.

Frontend phải nhận được:

```json
{
  "message": "No PENDING deposit found for room: 3",
  "status": false
}
```

5. Thêm handler còn thiếu:

```java
@ExceptionHandler(RuntimeException.class)
@ExceptionHandler(IllegalArgumentException.class)
```

theo cùng phong cách APIResponse cũ.

6. Không sử dụng:

```java
ApiResponse.success(...)
ApiResponse.error(...)
@Builder
Generic ApiResponse<T>
error field
code field
success field
```

7. Kiểm tra toàn bộ controller đã refactor và chuyển lại về style cũ giống BranchController:

* ResponseEntity<DTO>
* ResponseEntity<PageResponse<DTO>>
* ResponseEntity<String>

8. Trả về danh sách đầy đủ các file cần sửa và code hoàn chỉnh cho từng file.

Mục tiêu cuối cùng:

* Giữ code đơn giản.
* Dễ debug.
* FE luôn nhận được message lỗi trực tiếp.
* Hành vi giống phiên bản trước khi refactor sang ApiResponse<T>.
