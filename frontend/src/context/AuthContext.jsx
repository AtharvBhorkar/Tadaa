import { createContext, useEffect, useState } from "react";
import { TOKEN_KEY } from "../api/axios";
import { getMeApi, loginApi, signupApi } from "../api/auth.api";

export const AuthContext = createContext(null);

const normalize = (u) => ({ ...u, id: u.id || u._id });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    getMeApi()
      .then((d) => setUser(normalize(d.user)))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(normalize(data.user));
    return data.user;
  };

  const login = async (form) => handleAuth(await loginApi(form));
  const signup = async (form) => handleAuth(await signupApi(form));

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}