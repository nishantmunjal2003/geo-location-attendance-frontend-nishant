import axios from "axios";
import { useMemo } from "react";

const useAxios = () => {
  const token = localStorage.getItem("token");

  const Axios = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.REACT_APP_URL,
      headers: { "x-access-token": token },
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        if (status === 401) {
          localStorage.clear();
          window.location = "/";
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [token]);

  return Axios;
};

export default useAxios;
