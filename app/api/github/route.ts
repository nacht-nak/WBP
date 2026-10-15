import { profile } from "@/data/profile";
import { parseGithubCalendar } from "@/lib/github-calendar";

export async function GET() {
  const username =
    process.env.GITHUB_USERNAME ||
    (profile.github
      ? new URL(profile.github).pathname.split("/").filter(Boolean)[0]
      : "");
  const token = process.env.GITHUB_TOKEN;
  if (!username || !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username))
    return Response.json({
      available: false,
      message:
        "GitHub profile not connected. No contribution data is displayed.",
    });
  const profileUrl = `https://github.com/${username}`;
  if (token)
    try {
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query:
            "query($login: String!) { user(login: $login) { url contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }",
          variables: { login: username },
        }),
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 },
      });
      if (!response.ok) throw new Error("GitHub unavailable");
      const result = await response.json();
      const user = result.data?.user;
      if (result.errors || !user?.contributionsCollection?.contributionCalendar)
        throw new Error("Invalid GitHub response");
      return Response.json({
        available: true,
        profileUrl: user.url,
        ...user.contributionsCollection.contributionCalendar,
      });
    } catch {
      /* Fall back to GitHub's public calendar if authenticated access fails. */
    }
  try {
    const response = await fetch(
      `https://github.com/users/${username}/contributions`,
      {
        headers: {
          Accept: "text/html",
          "Accept-Language": "en",
          "User-Agent": "Portfolio-Activity",
        },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 },
      },
    );
    if (!response.ok) throw new Error("GitHub unavailable");
    const calendar = parseGithubCalendar(await response.text());
    return Response.json({ available: true, profileUrl, ...calendar });
  } catch {
    return Response.json({
      available: false,
      profileUrl,
      message:
        "GitHub activity is temporarily unavailable. Please try again later.",
    });
  }
}
