import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_platform_admin: boolean;
  is_active: boolean;
}

interface Organization {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  role: string | null;
  branchIds: string[];
  selectedBranchId: string;
  branches: any[];
  isLoading: boolean;
  
  // Super Admin Impersonation context
  impersonatedOrg: Organization | null;
  setImpersonatedOrg: (org: Organization | null) => void;
  
  login: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  logout: () => void;
  setSelectedBranchId: (id: string) => void;
  reloadMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchState] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [impersonatedOrg, setImpersonatedOrgState] = useState<Organization | null>(null);

  const loadMe = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      
      const savedImpersonated = localStorage.getItem("impersonated_org");
      if (response.data.user.is_platform_admin && savedImpersonated) {
        const parsed = JSON.parse(savedImpersonated);
        setImpersonatedOrgState(parsed);
        setOrganization(parsed);
        
        // Fetch branches for impersonated org
        const branchRes = await api.get(`/organizations/${parsed.id}/branches`);
        setBranches(branchRes.data);
        setSelectedBranchState("all");
      } else {
        setOrganization(response.data.organization);
        setRole(response.data.role);
        setBranchIds(response.data.branch_ids);

        if (response.data.organization) {
          const branchRes = await api.get(`/organizations/${response.data.organization.id}/branches`);
          setBranches(branchRes.data);
          
          const saved = localStorage.getItem("selected_branch_id");
          if (saved && (saved === "all" || branchRes.data.some((b: any) => b.id === saved))) {
            setSelectedBranchState(saved);
          } else {
            setSelectedBranchState(response.data.role === "OWNER" ? "all" : (branchRes.data[0]?.id || "all"));
          }
        }
      }
    } catch (err) {
      setUser(null);
      setOrganization(null);
      setRole(null);
      setBranchIds([]);
      setBranches([]);
      setImpersonatedOrgState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      loadMe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (tokens: { access_token: string; refresh_token: string }) => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    setIsLoading(true);
    await loadMe();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("selected_branch_id");
    localStorage.removeItem("impersonated_org");
    setUser(null);
    setOrganization(null);
    setRole(null);
    setBranchIds([]);
    setBranches([]);
    setSelectedBranchState("all");
    setImpersonatedOrgState(null);
    window.location.href = "/login";
  };

  const setSelectedBranchId = (id: string) => {
    localStorage.setItem("selected_branch_id", id);
    setSelectedBranchState(id);
  };

  const setImpersonatedOrg = (org: Organization | null) => {
    if (org) {
      localStorage.setItem("impersonated_org", JSON.stringify(org));
    } else {
      localStorage.removeItem("impersonated_org");
    }
    setImpersonatedOrgState(org);
    loadMe();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        branchIds,
        selectedBranchId,
        branches,
        isLoading,
        impersonatedOrg,
        setImpersonatedOrg,
        login,
        logout,
        setSelectedBranchId,
        reloadMe: loadMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
