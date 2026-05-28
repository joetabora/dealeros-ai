import { cookies } from "next/headers";

import type { DealershipProposal } from "@/types/closing-kit";

const PROPOSAL_COOKIE_PREFIX = "dealeros_proposal_";
const PROPOSAL_INDEX_COOKIE = "dealeros_proposal_index";
const MAX_STORED_PROPOSALS = 8;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function proposalCookieName(id: string) {
  return `${PROPOSAL_COOKIE_PREFIX}${id}`;
}

async function readIndex(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PROPOSAL_INDEX_COOKIE)?.value;

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(ids: string[]) {
  const cookieStore = await cookies();
  cookieStore.set(PROPOSAL_INDEX_COOKIE, JSON.stringify(ids.slice(0, MAX_STORED_PROPOSALS)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function saveProposal(proposal: DealershipProposal) {
  const cookieStore = await cookies();
  const cookieName = proposalCookieName(proposal.id);

  cookieStore.set(cookieName, JSON.stringify(proposal), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  const index = await readIndex();
  const nextIndex = [proposal.id, ...index.filter((id) => id !== proposal.id)].slice(
    0,
    MAX_STORED_PROPOSALS,
  );

  await writeIndex(nextIndex);

  return proposal;
}

export async function getProposal(id: string): Promise<DealershipProposal | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(proposalCookieName(id))?.value;

  if (!raw) return null;

  try {
    return JSON.parse(raw) as DealershipProposal;
  } catch {
    return null;
  }
}
