import api from "./api";

export const login = async (email: string, password: string) => {
  try {
    // Attempt System Admin Login
    const response = await api.post("/auth/login", { email, password });
    const { token, admin } = response.data;
    
    if (token) {
      sessionStorage.setItem("token", token);
      localStorage.setItem("token", token);
      const userToStore = { ...admin, role: 'SYSTEM_ADMIN' };
      sessionStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.setItem("user", JSON.stringify(userToStore));
    }
    
    return { token, admin: { ...admin, role: 'SYSTEM_ADMIN' } };
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 404) {
      try {
        // Fallback: Attempt Franchise Admin Login
        const frRes = await api.post("/franchise/auth/login", { email, password });
        const { token, admin } = frRes.data;
        
        if (token) {
          sessionStorage.setItem("token", token);
          localStorage.setItem("token", token);
          const userToStore = { ...admin, role: 'FRANCHISE_ADMIN' };
          sessionStorage.setItem("user", JSON.stringify(userToStore));
          localStorage.setItem("user", JSON.stringify(userToStore));
        }
        
        return { token, admin: { ...admin, role: 'FRANCHISE_ADMIN' } };
      } catch (frError: any) {
        if (frError.response?.status === 401 || frError.response?.status === 404 || frError.response?.status === 403) {
          // Fallback: Attempt Parent Login
          const parentRes = await api.post("/parent/auth/login", { email, password });
          const { token, parent } = parentRes.data;
          
          if (token) {
            sessionStorage.setItem("token", token);
            localStorage.setItem("token", token);
            const userToStore = { ...parent, role: 'PARENT' };
            sessionStorage.setItem("user", JSON.stringify(userToStore));
            localStorage.setItem("user", JSON.stringify(userToStore));
          }
          
          return { token, admin: { ...parent, role: 'PARENT' } };
        }
        throw frError;
      }
    }
    throw error;
  }
};