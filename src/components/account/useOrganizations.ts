import { useCallback, useEffect, useState } from 'react';
import { api } from './ui';

export interface Tenant {
  tenant_id: string;
  name: string;
  type: 'personal' | 'enterprise';
  role: 'member' | 'org_admin';
}

export interface Organization {
  id: string;
  name: string;
  type: 'personal' | 'enterprise';
  status: 'active' | 'suspended';
  ai_data_authorized?: number;
  /** Whether VisionCloud confirmed the current setting (null: this edition has no VisionCloud). */
  cloud_synced?: boolean | null;
  member_count?: number;
}

/** One organization the account page can show: the user's own, or any enterprise one for platform admins. */
export interface OrgChoice {
  id: string;
  name: string;
  type: 'personal' | 'enterprise';
  /** The user's role in it; null when only platform administration gives access. */
  role: 'member' | 'org_admin' | null;
  /** Can manage members, data authorization and see the credit account. */
  admin: boolean;
  status?: 'active' | 'suspended';
}

export interface OrganizationsState {
  loaded: boolean;
  error: string;
  tenants: Tenant[];
  platformAdmin: boolean;
  creditsAvailable: boolean;
  cloudAdminUrl: string | null;
  /** Enterprise organizations of the whole platform (platform admins only). */
  allOrganizations: Organization[];
  /** The user's organizations first, then the rest of the platform for platform admins. */
  choices: OrgChoice[];
  reload: () => Promise<void>;
}

/** GET /api/orgs, shared by the overview, the organization and the credits sections. */
export function useOrganizations(zh: boolean): OrganizationsState {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const [creditsAvailable, setCreditsAvailable] = useState(false);
  const [cloudAdminUrl, setCloudAdminUrl] = useState<string | null>(null);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);

  const reload = useCallback(async () => {
    const { ok, data } = await api('/api/orgs').catch(() => ({ ok: false, status: 0, data: {} as any }));
    setLoaded(true);
    if (!ok) { setError(data.error || (zh ? '无法读取组织信息' : 'Could not load organizations')); return; }
    setError('');
    setTenants(data.tenants || []);
    setPlatformAdmin(!!data.is_platform_admin);
    setCreditsAvailable(!!data.credits_available);
    setCloudAdminUrl(data.cloud_admin_url || null);
    setAllOrganizations(data.organizations || []);
  }, [zh]);

  useEffect(() => { void reload(); }, [reload]);

  const choices: OrgChoice[] = tenants.map(tenant => ({
    id: tenant.tenant_id, name: tenant.name, type: tenant.type, role: tenant.role,
    admin: platformAdmin || tenant.role === 'org_admin',
    status: allOrganizations.find(org => org.id === tenant.tenant_id)?.status,
  }));
  if (platformAdmin) {
    for (const org of allOrganizations) {
      if (!choices.some(choice => choice.id === org.id)) {
        choices.push({ id: org.id, name: org.name, type: org.type, role: null, admin: true, status: org.status });
      }
    }
  }

  return { loaded, error, tenants, platformAdmin, creditsAvailable, cloudAdminUrl, allOrganizations, choices, reload };
}

export const roleLabel = (role: string | null, zh: boolean) => (
  role === 'admin' || role === 'org_admin' ? (zh ? '管理员' : 'Admin')
    : role === 'member' ? (zh ? '成员' : 'Member')
    : (zh ? '平台管理' : 'Platform admin'));
