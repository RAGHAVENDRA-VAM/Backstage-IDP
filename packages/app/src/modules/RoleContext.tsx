import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';

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
    allowedTabs: ['overview', 'automation', 'observability', 'sre', 'cloud-native', 'security', 'finops', 'governance', 'jira', 'github', 'azure', 'datadog', 'ai-cost', 'scaffolder', 'catalog', 'techdocs'],
  },
  developer: {
    id: 'developer',
    title: 'Software Developer',
    badge: 'Developer Access',
    color: '#2563eb',
    description: 'Focused developer self-service workspace: active microservices, PR reviews, CI/CD workflow status, issue tracking, and quick code scaffolding.',
    allowedTabs: ['overview', 'automation', 'observability', 'jira', 'github', 'scaffolder', 'catalog', 'techdocs'],
  },
  finops: {
    id: 'finops',
    title: 'FinOps & Cost Governance',
    badge: 'FinOps Access',
    color: '#9333ea',
    description: 'Dedicated financial operations hub: Azure AI Foundry GenAI unit economics, cloud cost velocity, resource rightsizing, and FinOps pipelines.',
    allowedTabs: ['overview', 'finops', 'governance', 'cloud-native', 'ai-cost', 'azure'],
  },
};

// Enterprise Organization Persona Mappings by Email
export const ROLE_EMAIL_MAPPINGS: Record<string, UserRole> = {
  // Platform Engineers (Admin Access)
  'raghavendra.lakkamaraju@valuemomentum.com': 'platform-engineer',
  'vamsi.sapireddy@valuemomentum.com': 'platform-engineer',
  'prayanka.gochipatula@valuemomentum.com': 'platform-engineer',
  'shankar.vinjamuri@valuemomentum.com': 'platform-engineer',

  // Developer Workspace
  'shashank.tudum@valuemomentum.com': 'developer',
  'mohansai.ande@valuemomentum.com': 'developer',

  // FinOps & Cost Governance
  'hari.ponnamanda@valuemomentum.com': 'finops',
  'shaik.zaheer@valuemomentum.com': 'finops',
};

// User-Login Fallback Mappings (GitHub Usernames)
export const ROLE_LOGIN_MAPPINGS: Record<string, UserRole> = {
  'raghavendra-vam': 'platform-engineer',
  'vamsi-sapireddy': 'platform-engineer',
  'prayanka-gochipatula': 'platform-engineer',
  'shankar-vinjamuri': 'platform-engineer',
  'shashanktu': 'developer',
  'mohansai001': 'developer',
  'hari-var': 'finops',
  'shaikzaheer': 'finops',
};

export const resolveRoleForUser = (email?: string, userRef?: string): UserRole => {
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (ROLE_EMAIL_MAPPINGS[normalizedEmail]) {
      return ROLE_EMAIL_MAPPINGS[normalizedEmail];
    }
  }

  if (userRef) {
    const username = userRef.split('/').pop()?.toLowerCase() || '';
    if (ROLE_LOGIN_MAPPINGS[username]) {
      return ROLE_LOGIN_MAPPINGS[username];
    }
  }

  // Default to platform engineer for admin/default demo account
  return 'platform-engineer';
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roleInfo: RoleInfo;
  isAllowed: (tabOrFeature: string) => boolean;
  userEmail?: string;
}

const RoleContext = createContext<RoleContextType>({
  role: 'platform-engineer',
  setRole: () => {},
  roleInfo: ROLES['platform-engineer'],
  isAllowed: () => true,
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const identityApi = useApi(identityApiRef);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [role, setRoleState] = useState<UserRole>('platform-engineer');

  useEffect(() => {
    let isMounted = true;
    async function detectUserRole() {
      try {
        const [profile, identity] = await Promise.all([
          identityApi.getProfileInfo().catch(() => undefined),
          identityApi.getBackstageIdentity().catch(() => undefined),
        ]);

        const email = profile?.email;
        const userRef = identity?.userEntityRef;

        if (isMounted && email) {
          setUserEmail(email);
        }

        const resolved = resolveRoleForUser(email, userRef);
        if (isMounted) {
          setRoleState(resolved);
          try {
            localStorage.setItem('shield_idp_active_role', resolved);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to resolve persona from identity:', err);
      }
    }

    detectUserRole();
    return () => {
      isMounted = false;
    };
  }, [identityApi]);

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
    <RoleContext.Provider value={{ role, setRole, roleInfo, isAllowed, userEmail }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useUserRole = () => useContext(RoleContext);
