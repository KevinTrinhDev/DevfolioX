// lib/github/contributions.ts
const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

export type GitHubContributionDay = {
  date: string; // "2025-03-15"
  count: number; // total contributions that day
};

const CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export async function fetchGitHubContributionsForYear(
  username: string,
  year: number
): Promise<GitHubContributionDay[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN env var");
  }

  const from = new Date(year, 0, 1);
  const to = new Date(year, 11, 31, 23, 59, 59);

  const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: {
        login: username,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GraphQL error: ${res.status} - ${text}`);
  }

  const json = await res.json();

  const weeks =
    json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ??
    [];

  const days: GitHubContributionDay[] = [];
  for (const week of weeks) {
    for (const d of week.contributionDays ?? []) {
      if (!d?.date) continue;
      days.push({
        date: d.date,
        count: d.contributionCount ?? 0,
      });
    }
  }

  return days;
}
