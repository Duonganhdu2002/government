// src/utils/logoutHandler.ts
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export const useLogoutHandler = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Nếu có API logout phía server, bạn có thể gọi ở đây
      // await logoutUserAPI(userId); // Nếu cần

      // Xoá các token khỏi cookie
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      // Cập nhật state Redux
      dispatch(logout());

      // Chuyển hướng người dùng đến trang đăng nhập (hoặc trang chủ)
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return handleLogout;
};
