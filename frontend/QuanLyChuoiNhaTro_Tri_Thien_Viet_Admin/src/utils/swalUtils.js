import Swal from 'sweetalert2';

export const confirmAction = ({
  title = 'Xác nhận',
  text = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  icon = 'question',
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  confirmColor = '#3085d6',
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: '#d33',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    // Thêm các tùy chỉnh để hợp với giao diện Admin của bạn
    customClass: {
        popup: 'rounded-4', // Bo góc giống Card của bạn
        confirmButton: 'rounded-3',
        cancelButton: 'rounded-3'
    }
  });
};