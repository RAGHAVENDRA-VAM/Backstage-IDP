import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'platform-engineer' | 'developer' | 'finops';

export interface RoleInfo {
  id: UserRole;
  title: string;
  badge: string;
  color: string;
  description: string;
  allowedTabs: string[];
}

export const ROLES: Record<UserRole, RoleInfo> = {
  'platform-engineer': {
    id: 'platform-engineer',
    title: 'Platform Engineer (Admin)',
    badge: 'Admin Access',
    color: '#059669',
    description: 'Full enterprise IDP control across all 50 repositories, infrastructure provisioning, pipelines, Datadog observability, and golden path scaffolding.',
    allowedTabs: ['overview', 'jira', 'github', 'azure', 'datadog', 'ai-cost', 'scaffolder', 'catalog', 'techdocs'],
  },
  developer: {
    id: 'developer',
    title: 'Software Developer',
    badge: 'Developer Access',
    color: '#2563eb',
    description: 'Focused developer self-service workspace: active microservices, PR reviews, CI/CD workflow status, issue tracking, and quick code scaffolding.',
    allowedTabs: ['overview', 'jira', 'github', 'scaffolder', 'catalog', 'techdocs'],
  },
  finops: {
    id: 'finops',
    title: 'FinOps & Cost Governance',
    badge: 'FinOps Access',
    color: '#9333ea',
    description: 'Dedicated financial operations hub: Azure AI Foundry GenAI unit economics, cloud cost velocity, resource rightsizing, and FinOps pipelines.',
    allowedTabs: ['ai-cost', 'azure', 'overview'],
  },
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roleInfo: RoleInfo;
  isAllowed: (tabOrFeature: string) => boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: 'platform-engineer',
  setRole: () => {},
  roleInfo: ROLES['platform-engineer'],
  isAllowed: () => true,
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('shield_idp_active_role');
      if (saved && (saved === 'platform-engineer' || saved === 'developer' || saved === 'finops')) {
        return saved as UserRole;
      }
    } catch {
      // fallback
    }
    return 'platform-engineer';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem('shield_idp_active_role', newRole);
    } catch {
      // ignore
    }
  };

  const roleInfo = ROLES[role] || ROLES['platform-engineer'];

  const isAllowed = (tabOrFeature: string): boolean => {
    if (role === 'platform-engineer') return true;
    return roleInfo.allowedTabs.includes(tabOrFeature);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, roleInfo, isAllowed }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useUserRole = () => useContext(RoleContext);
