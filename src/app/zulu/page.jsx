"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../styles/default.module.css";

export default function DualClock({
  localTimeZone = "America/New_York",
  showSeconds = false,
}) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const timeOptions = useMemo(
    () => ({
      hour: "2-digit",
      minute: "2-digit",
      ...(showSeconds ? { second: "2-digit" } : {}),
      hourCycle: "h23",
    }),
    [showSeconds]
  );

  const zuluTime = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      ...timeOptions,
      timeZone: "UTC",
    }).format(currentTime);
  }, [currentTime, timeOptions]);

  const localTime = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      ...timeOptions,
      timeZone: localTimeZone,
    }).format(currentTime);
  }, [currentTime, localTimeZone, timeOptions]);

  const localZoneName = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: localTimeZone,
      timeZoneName: "short",
    })
      .formatToParts(currentTime)
      .find((part) => part.type === "timeZoneName")?.value;
  }, [currentTime, localTimeZone]);

  const localDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: localTimeZone,
    }).format(currentTime);
  }, [currentTime, localTimeZone]);

  const utcDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(currentTime);
  }, [currentTime]);

  return (
    <section
      className={styles.clockPanel}
      aria-label="Current Zulu and local time"
    >
      <div className={styles.clockPanelHeader}>
        <div>
          <p className={styles.clockEyebrow}>Operational Time Reference</p>
          <h2 className={styles.clockTitle}>Live Time Status</h2>
        </div>

        <div className={styles.clockLiveIndicator}>
          <span className={styles.clockLiveDot} />
          LIVE
        </div>
      </div>

      <div className={styles.clockGrid}>
        <article className={`${styles.clockCard} ${styles.zuluClockCard}`}>
          <div className={styles.clockCardTopRow}>
            <span className={styles.clockBadge}>UTC</span>
            <span className={styles.clockStatusText}>Zulu Reference</span>
          </div>

          <p className={styles.clockLabel}>Zulu Time</p>

          <time className={styles.clockValue} dateTime={currentTime.toISOString()}>
            {zuluTime}
          </time>

          <div className={styles.clockFooter}>
            <span>{utcDate}</span>
            <span className={styles.clockFooterDivider}>•</span>
            <span>UTC / Z</span>
          </div>
        </article>

        <article className={`${styles.clockCard} ${styles.localClockCard}`}>
          <div className={styles.clockCardTopRow}>
            <span className={styles.clockBadge}>LOCAL</span>
            <span className={styles.clockStatusText}>{localZoneName || "ET"}</span>
          </div>

          <p className={styles.clockLabel}>Local Time</p>

          <time className={styles.clockValue} dateTime={currentTime.toISOString()}>
            {localTime}
          </time>

          <div className={styles.clockFooter}>
            <span>{localDate}</span>
            <span className={styles.clockFooterDivider}>•</span>
            <span>{localTimeZone}</span>
          </div>
        </article>
      </div>
    </section>
  );
}