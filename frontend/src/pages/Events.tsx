import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import {
  getAlarmOffsetConfig,
  getAlarmRecordingClip,
  downloadAlarmRecordingClip,
} from "@/services/alarmRecordingService";
import type { AlarmOffsetConfig, AlarmRecordingClip, Event } from "@/types";
import {
  getEventDescription,
  getEventTypeLabel,
} from "@/utils/eventPresentation";

type StatusFilter = "all" | "open" | "acknowledged";
const processes = [
  { code: "HEATING", ko: "가열", en: "Heating" },
  { code: "ROLLING", ko: "압연", en: "Rolling" },
  { code: "COOLING", ko: "냉각", en: "Cooling" },
  { code: "FINISHING", ko: "정정", en: "Finishing" },
];

function userKey(userId: number | undefined, username: string | undefined) {
  return String(userId ?? username ?? "anonymous");
}

export function Events() {
  const { t, i18n } = useTranslation();
  const { filter, events, loading } = useAppSelector((state) => state.event);
  const cameras = useAppSelector((state) => state.camera.cameras);
  const user = useAppSelector((state) => state.auth.user);
  const currentUserKey = userKey(user?.id, user?.username);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [process, setProcess] = useState("");
  const [model, setModel] = useState("");
  const [judgment, setJudgment] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState({
    process: "",
    model: "",
    judgment: "",
  });
  const [clip, setClip] = useState<AlarmRecordingClip | null>(null);
  const [clipLoading, setClipLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [gridCollapsed, setGridCollapsed] = useState(false);
  const offsetConfig: AlarmOffsetConfig = getAlarmOffsetConfig();

  const acknowledgedForUser = (event: Event) =>
    event.acknowledgementByUser?.[currentUserKey]?.acknowledged ??
    event.acknowledged;
  const localAcknowledgement = (event: Event) => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("alarmAcknowledgements") ?? "{}",
      ) as Record<string, Record<string, { acknowledged: boolean }>>;
      return Boolean(saved[currentUserKey]?.[event.id]?.acknowledged);
    } catch {
      return false;
    }
  };
  const isAcknowledged = (event: Event) =>
    acknowledgedForUser(event) || localAcknowledgement(event);
  const cameraName = (id: number) =>
    cameras.find((camera) => camera.id === id)?.name ??
    t("events.cameraFallback", { id });
  const label = (event: Event) => getEventTypeLabel(event.type, t);
  const description = (event: Event) =>
    getEventDescription(event, i18n.resolvedLanguage ?? i18n.language, t);
  const dateTime = (date: Date) =>
    new Intl.DateTimeFormat(
      i18n.resolvedLanguage === "ko" ? "ko-KR" : "en-US",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      },
    ).format(date);

  const filteredEvents = useMemo(
    () =>
      [...events]
        .filter((event) => {
          const acknowledged = isAcknowledged(event);
          const query = search.trim().toLocaleLowerCase();
          if (statusFilter === "open" && acknowledged) return false;
          if (statusFilter === "acknowledged" && !acknowledged) return false;
          if (filter.severity && event.severity !== filter.severity)
            return false;
          if (filter.cameraId && event.cameraId !== filter.cameraId)
            return false;
          if (filter.type && event.type !== filter.type) return false;
          if (
            submittedQuery.process &&
            event.processCode !== submittedQuery.process
          )
            return false;
          if (submittedQuery.model && event.modelName !== submittedQuery.model)
            return false;
          if (
            submittedQuery.judgment &&
            event.judgment !== submittedQuery.judgment
          )
            return false;
          if (
            query &&
            ![
              label(event),
              description(event),
              cameraName(event.cameraId),
              event.modelName ?? "",
              event.location ?? "",
              String(event.id),
            ].some((value) => value.toLocaleLowerCase().includes(query))
          )
            return false;
          return true;
        })
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [
      events,
      filter,
      statusFilter,
      search,
      submittedQuery,
      i18n.resolvedLanguage,
      cameras,
      currentUserKey,
    ],
  );

  const selected =
    selectedId === null
      ? null
      : (events.find((event) => event.id === selectedId) ?? null);

  useEffect(() => {
    if (!selected) {
      setClip(null);
      return;
    }
    let active = true;
    setClipLoading(true);
    void getAlarmRecordingClip(selected, offsetConfig)
      .then((nextClip) => {
        if (active) setClip(nextClip);
      })
      .finally(() => {
        if (active) setClipLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected?.id]);

  const acknowledge = (event: Event) => {
    const raw = localStorage.getItem("alarmAcknowledgements");
    const saved = raw
      ? (JSON.parse(raw) as Record<
          string,
          Record<string, { acknowledged: boolean; acknowledgedAt: string }>
        >)
      : {};
    localStorage.setItem(
      "alarmAcknowledgements",
      JSON.stringify({
        ...saved,
        [currentUserKey]: {
          ...(saved[currentUserKey] ?? {}),
          [event.id]: {
            acknowledged: true,
            acknowledgedAt: new Date().toISOString(),
          },
        },
      }),
    );
    setNotice(t("events.acknowledgedNotice"));
  };

  const download = async (event: Event) => {
    try {
      const result = await downloadAlarmRecordingClip(event, offsetConfig);
      const anchor = document.createElement("a");
      anchor.href = result.downloadUrl!;
      anchor.download = `alarm-${event.id}-clip.txt`;
      anchor.click();
      setNotice(t("events.downloadComplete"));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : t("events.downloadUnavailable"),
      );
    }
  };

  const severityClass = (severity: Event["severity"]) =>
    ({
      low: "border-sky-300 bg-sky-50 text-sky-800",
      medium: "border-amber-300 bg-amber-50 text-amber-800",
      high: "border-orange-300 bg-orange-50 text-orange-800",
      critical: "border-rose-300 bg-rose-50 text-rose-800",
    })[severity];

  return (
    <main className="mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t("events.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t("events.subtitle")}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {t("events.asOf", {
            date: new Intl.DateTimeFormat(
              i18n.language === "ko" ? "ko-KR" : "en-US",
            ).format(new Date()),
          })}
        </p>
      </header>
      <section
        aria-label={t("events.filters")}
        className="flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
      >
        <label className="min-w-40 text-xs font-medium">
          {t("events.process")}
          <select
            value={process}
            onChange={(e) => setProcess(e.target.value)}
            className="mt-1 block h-10 w-full rounded border px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">{t("events.allProcesses")}</option>
            {processes.map((item) => (
              <option key={item.code} value={item.code}>
                {i18n.language === "ko" ? item.ko : item.en}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-52 flex-1 text-xs font-medium">
          {t("events.aiModel")}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 block h-10 w-full rounded border px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">{t("events.allModels")}</option>
            {Array.from(
              new Set(events.map((event) => event.modelName).filter(Boolean)),
            ).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-32 text-xs font-medium">
          {t("events.judgment")}
          <select
            value={judgment}
            onChange={(e) => setJudgment(e.target.value)}
            className="mt-1 block h-10 w-full rounded border px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">{t("events.allJudgments")}</option>
            <option value="OK">OK</option>
            <option value="NG">NG</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => setSubmittedQuery({ process, model, judgment })}
          className="h-10 rounded bg-slate-800 px-5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          {t("events.query")}
        </button>
        <label className="min-w-44 flex-1 text-xs font-medium">
          {t("events.search")}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("events.searchPlaceholder")}
            className="mt-1 h-10 w-full rounded border px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </label>
      </section>
      {notice && (
        <button
          type="button"
          onClick={() => setNotice("")}
          className="self-end rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-800"
        >
          {notice}
        </button>
      )}
      <section
        className={`grid min-h-0 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 ${gridCollapsed ? "xl:grid-cols-[48px_minmax(0,1fr)]" : "xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]"}`}
      >
        <div
          className={`min-h-0 overflow-hidden ${gridCollapsed ? "border-r dark:border-gray-700" : ""}`}
        >
          <div className="flex h-12 items-center justify-between border-b px-4 dark:border-gray-700">
            <h2 className={gridCollapsed ? "sr-only" : "text-sm font-semibold"}>
              {t("events.alarmList")}{" "}
              <span className="ml-2 text-xs font-normal text-gray-500">
                {t("events.resultCount", { count: filteredEvents.length })}
              </span>
            </h2>
            <div
              className={
                gridCollapsed
                  ? "flex w-full justify-center"
                  : "flex items-center gap-2"
              }
            >
              <div
                className="inline-flex rounded border p-0.5"
                role="group"
                aria-label={t("events.statusFilter")}
              >
                {!gridCollapsed &&
                  (["open", "all", "acknowledged"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      aria-pressed={statusFilter === status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded px-2.5 py-1.5 text-xs ${statusFilter === status ? "bg-slate-800 text-white" : "text-gray-600"}`}
                    >
                      {t(`events.statusFilters.${status}`)}
                    </button>
                  ))}
              </div>
              <button
                type="button"
                onClick={() => setGridCollapsed((value) => !value)}
                className="rounded border px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
                aria-label={
                  gridCollapsed
                    ? t("events.expandGrid")
                    : t("events.collapseGrid")
                }
                title={
                  gridCollapsed
                    ? t("events.expandGrid")
                    : t("events.collapseGrid")
                }
              >
                {gridCollapsed ? "›" : "‹"}
              </button>
            </div>
          </div>
          {!gridCollapsed && (
            <div className="h-[calc(100%-3rem)] overflow-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-3">{t("events.category")}</th>
                    <th className="px-3 py-3">{t("events.process")}</th>
                    <th className="px-3 py-3">{t("events.time")}</th>
                    <th className="px-3 py-3">{t("events.location")}</th>
                    <th className="px-3 py-3">{t("events.aiModel")}</th>
                    <th className="px-3 py-3">{t("events.judgment")}</th>
                    <th className="px-3 py-3">{t("events.download")}</th>
                    <th className="px-3 py-3">{t("events.acknowledgement")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-12 text-center text-gray-500"
                      >
                        {t("events.loading")}
                      </td>
                    </tr>
                  ) : filteredEvents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-12 text-center text-gray-500"
                      >
                        {t("events.noResults")}
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => {
                      const acknowledged = isAcknowledged(event);
                      return (
                        <tr
                          key={event.id}
                          onClick={() => setSelectedId(event.id)}
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/70 ${selected?.id === event.id ? "bg-blue-50/70 dark:bg-blue-950/30" : ""}`}
                        >
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(event.id);
                              }}
                              className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${severityClass(event.severity)}`}
                            >
                              {label(event)}
                            </button>
                            <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                              {description(event)}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            {event.processName ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums">
                            {dateTime(event.timestamp)}
                          </td>
                          <td className="px-3 py-3">
                            {event.location ?? cameraName(event.cameraId)}
                          </td>
                          <td className="max-w-[220px] truncate px-3 py-3">
                            {event.modelName ?? "-"}
                          </td>
                          <td
                            className={`px-3 py-3 font-semibold ${event.judgment === "NG" ? "text-rose-600" : "text-emerald-600"}`}
                          >
                            {event.judgment ?? "-"}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void download(event);
                              }}
                              className="text-blue-700 hover:underline"
                            >
                              {t("events.download")}
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            {acknowledged ? (
                              <span className="text-xs text-gray-500">
                                {t("events.statuses.acknowledged")}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  acknowledge(event);
                                }}
                                className="rounded bg-blue-700 px-2 py-1 text-xs font-semibold text-white"
                              >
                                {t("events.acknowledge")}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <aside className="min-h-0 border-t border-gray-200 xl:border-l xl:border-t-0 dark:border-gray-700">
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3 dark:border-gray-700">
                <h2 className="text-sm font-semibold">
                  {t("events.recordingTitle")}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {dateTime(selected.timestamp)} ·{" "}
                  {selected.location ?? cameraName(selected.cameraId)}
                </p>
              </div>
              <div className="space-y-4 overflow-auto p-4">
                <div className="aspect-video overflow-hidden rounded bg-slate-950">
                  {clipLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      {t("events.loadingVideo")}
                    </div>
                  ) : clip?.playbackUrl ? (
                    <video
                      className="h-full w-full"
                      src={clip.playbackUrl}
                      controls
                      autoPlay
                      muted
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-5 text-center text-sm text-gray-400">
                      {clip?.message || t("events.noRecording")}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("events.judgment")}
                    </p>
                    <p
                      className={`mt-1 font-bold ${selected.judgment === "NG" ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {selected.judgment ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("events.acknowledgement")}
                    </p>
                    <p className="mt-1">
                      {isAcknowledged(selected)
                        ? t("events.statuses.acknowledged")
                        : t("events.statuses.open")}
                    </p>
                  </div>
                </div>
                <div className="rounded border p-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  <p className="font-semibold">{t("events.clipRange")}</p>
                  <p className="mt-1">
                    {t("events.clipRangeValue", {
                      before: offsetConfig.beforeSeconds,
                      after: offsetConfig.afterSeconds,
                    })}
                  </p>
                  {clip?.status === "partial" && (
                    <p className="mt-1 text-amber-600">{clip.message}</p>
                  )}
                </div>
                <p className="text-sm leading-6">{description(selected)}</p>
                <div className="border-t pt-3 text-xs leading-5 text-gray-500 dark:border-gray-700">
                  {t("events.acknowledgementHint")}
                </div>
              </div>
              <div className="flex gap-2 border-t p-4 dark:border-gray-700">
                {!isAcknowledged(selected) && (
                  <button
                    type="button"
                    onClick={() => acknowledge(selected)}
                    className="flex-1 rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white"
                  >
                    {t("events.acknowledgeAlarm")}
                  </button>
                )}
                <button
                  type="button"
                  disabled={!clip?.downloadUrl}
                  onClick={() => void download(selected)}
                  className="rounded border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("events.downloadClip")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[360px] items-center justify-center px-6 text-center text-sm text-gray-500">
              {t("events.selectPrompt")}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default Events;
