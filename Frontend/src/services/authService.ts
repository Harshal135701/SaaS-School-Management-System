import api from "./api";

export const login = async (email: string, password: string) => {
  try {
    // Attempt System Admin Login
    const response = await api.post("/auth/login", { email, password });
    const { token, admin } = response.data;
    
    if (token) {
      localStorage.setItem("token", token);
    }
    
    return { token, admin: { ...admin, role: 'SYSTEM_ADMIN' } };
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 404) {
      // Fallback: Attempt Franchise Admin Login
      const frRes = await api.post("/franchise/auth/login", { email, password });
      const { token, data } = frRes.data;
      
      if (token) {
        localStorage.setItem("token", token);
      }
      
      return { token, admin: { ...data, role: 'FRANCHISE_ADMIN' } };
    }
    throw error;
  }
};