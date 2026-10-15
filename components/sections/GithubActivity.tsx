"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
type Day = {
  date: string;
  contributionCount: number;
  contributionLevel: string;
};
type Activity = {
  available: boolean;
  totalContributions?: number;
  weeks?: { contributionDays: Day[] }[];
  profileUrl?: string;
  message?: string;
};
const levels: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};
export function GithubActivity() {
  const [activity, setActivity] = useState<Activity | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/github", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw Error();
        return response.json();
      })
      .then(setActivity)
      .catch((error) => {
        if (error.name !== "AbortError")
          setActivity({
            available: false,
            message:
              "Activity is temporarily unavailable. Please try again later.",
          });
      });
    return () => controller.abort();
  }, []);
  let lastMonth = "";
  return (
    <section
      id="github-activity"
      className="detail-section github-section"
      aria-labelledby="github-heading"
    >
      <AnimatedReveal>
        <div className="detail-heading">
          <h2 id="github-heading">GitHub Activity</h2>
          {activity?.profileUrl && (
            <a
              className="text-link"
              href={activity.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View GitHub
              <ArrowUpRight size={12} />
            </a>
          )}
        </div>
        <div className="github-panel">
          <div
            className="contribution-scroll"
            tabIndex={0}
            role="region"
            aria-label="GitHub contribution calendar"
          >
            <div className="contribution-months">
              {activity?.available
                ? activity.weeks?.map((week, index) => {
                    const month = new Date(
                      week.contributionDays[0].date + "T12:00:00Z",
                    ).toLocaleString("en", { month: "short", timeZone: "UTC" });
                    const show = month !== lastMonth;
                    lastMonth = month;
                    return <span key={index}>{show ? month : ""}</span>;
                  })
                : [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((month) => <span key={month}>{month}</span>)}
            </div>
            <div
              className={`contribution-grid ${activity?.available ? "" : "not-connected"}`}
              aria-hidden={!activity?.available}
            >
              {activity?.available
                ? activity.weeks?.map((week, index) => (
                    <div className="contribution-week" key={index}>
                      {week.contributionDays.map((day) => (
                        <span
                          key={day.date}
                          className={`contribution-cell level-${levels[day.contributionLevel] || 0}`}
                          style={{
                            gridRow:
                              new Date(day.date + "T12:00:00Z").getUTCDay() + 1,
                          }}
                          role="img"
                          aria-label={`${day.contributionCount} contributions on ${day.date}`}
                          title={`${day.contributionCount} contributions on ${day.date}`}
                        />
                      ))}
                    </div>
                  ))
                : Array.from({ length: 53 }, (_, index) => (
                    <div className="contribution-week" key={index}>
                      {Array.from({ length: 7 }, (_, day) => (
                        <span className="contribution-cell" key={day} />
                      ))}
                    </div>
                  ))}
            </div>
          </div>
          <div className="github-panel-bottom">
            <p role="status">
              {activity === null
                ? "Loading activity…"
                : activity.available
                  ? `${activity.totalContributions?.toLocaleString()} contributions in the last year`
                  : activity.message ||
                    "GitHub profile not connected. No contribution data is displayed."}
            </p>
          </div>
        </div>
      </AnimatedReveal>
    </section>
  );
}
