import {
  IExportLogsServiceRequest,
  ILogRecord,
} from "@opentelemetry/otlp-transformer";
import LogViewer from "@/app/components/log-viewer";

async function getLogs(): Promise<Array<ILogRecord>> {
  const res = await fetch(
    "https://take-home-assignment-otlp-logs-api.vercel.app/api/logs",
    { cache: "no-store" },
  );

  const logs: IExportLogsServiceRequest = await res.json();

  // Map the response data to just an array of log entries, as this is the only required info
  return (
    logs.resourceLogs?.flatMap((resourceLog) => {
      return resourceLog.scopeLogs.flatMap((s) => s.logRecords ?? []);
    }) ?? []
  ).sort((a, b) => (a.timeUnixNano as number) - (b.timeUnixNano as number));
}

export default async function Home() {
  return <LogViewer logs={await getLogs()} />;
}
