export type SessionUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type SessionDealer = {
  id: string;
  name: string;
};

export type Session = {
  user: SessionUser;
  dealer: SessionDealer;
  tenant: import("@/types/tenant").TenantContext;
};
