// Protocol.land is dead — this file is kept as a stub to prevent import errors

interface Repo {
  name: string;
  cloneUrl: string;
}

export default async function fetchUserRepos(walletAddress: string): Promise<Repo[]> {
  console.warn("Protocol.land is no longer available");
  return [];
}
