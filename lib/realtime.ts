import { supabase } from "./supabase";

/**
 * Subscribe to new bids on a project
 */
export function subscribeToBidsOnProject(
  projectId: string,
  onNewBid: (bid: unknown) => void
) {
  const channel = supabase
    .channel(`project-bids:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Bid",
        filter: `projectId=eq.${projectId}`,
      },
      (payload) => {
        onNewBid(payload.new);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to project status changes
 */
export function subscribeToProjectUpdates(
  projectId: string,
  onStatusChange: (project: unknown) => void
) {
  const channel = supabase
    .channel(`project-updates:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Project",
        filter: `id=eq.${projectId}`,
      },
      (payload) => {
        onStatusChange(payload.new);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to all bids on a specific project
 */
export function subscribeToAllBidsOnProject(
  projectId: string,
  onBidsUpdate: (bids: unknown[]) => void
) {
  const channel = supabase
    .channel(`project-all-bids:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Bid",
        filter: `projectId=eq.${projectId}`,
      },
      () => {
        // Trigger refetch of all bids
        onBidsUpdate([]);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to fundings on a project
 */
export function subscribeToFundingsOnProject(
  projectId: string,
  onNewFunding: (funding: unknown) => void
) {
  const channel = supabase
    .channel(`project-fundings:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Funding",
        filter: `projectId=eq.${projectId}`,
      },
      (payload) => {
        onNewFunding(payload.new);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to leaderboard updates (top bidders)
 */
export function subscribeToLeaderboardUpdates(
  onUpdate: () => void
) {
  const channel = supabase
    .channel("leaderboard-updates")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Bid",
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
