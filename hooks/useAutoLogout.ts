import { useEffect } from "react";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export const useAutoLogout = () => {
  const dispatch = useAppDispatch();
  const { token, expiry } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!token || !expiry) return;

    const now = Date.now();

    if (now >= expiry) {
      dispatch(logout());
      return;
    }

    const remainingTime = expiry - now;

    const timer = setTimeout(() => {
      dispatch(logout());
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [token, expiry, dispatch]);
};
