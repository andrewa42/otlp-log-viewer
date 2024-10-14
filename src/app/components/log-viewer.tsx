"use client";

import React, { useState } from "react";
import { ILogRecord } from "@opentelemetry/otlp-transformer";
import { Histogram } from "@/app/components/histogram";

export default function LogViewer(props: { logs: Array<ILogRecord> }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(
    new Set<number>(),
  );

  const toggleExpand = (id: number) => {
    const newExpandedRows = new Set(expandedRows);

    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }

    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="container mx-auto w-[800px]">
      <h1 className="text-3xl font-bold my-4">OTLP Log Viewer</h1>
      <Histogram
          width={800}
          height={300}
          data={props.logs}
      />
      <table className="min-w-full table-fixed my-2 w-[800px]">
        <thead>
          <tr className="bg-gray-200 border border-gray-300">
            <th className="w-[105px] px-1 py-1 text-left border-r border-gray-300">
              SEVERITY
            </th>
            <th className="w-[220px] px-1 py-1 text-left border-r border-gray-300">
              TIME
            </th>
            <th className="w-auto px-1 py-1 text-left">BODY</th>
          </tr>
        </thead>
        <tbody>
          {props.logs.map((item) => {
            const timeUnixNano = item.timeUnixNano as number;
            const isSelected = expandedRows.has(timeUnixNano);

            const timestamp = new Date(timeUnixNano / 1000000).toISOString();

            let severityStyle;

            switch (item.severityText) {
              case "FATAL":
              case "ERROR":
                severityStyle = "text-red-600";
                break;
              case "WARN":
                severityStyle = "text-yellow-600";
                break;
              default:
                severityStyle = "text-blue-600";
                break;
            }

            return (
              <React.Fragment key={timeUnixNano}>
                <tr
                  className={`cursor-pointer border-t hover:bg-[#E8F0FE] ${isSelected ? "bg-[#E8F0FE]" : ""}`}
                  onClick={() => toggleExpand(timeUnixNano)}
                >
                  <td className={`w-[105px] px-1 py-1 ${severityStyle}`}>
                    {item.severityText}
                  </td>
                  <td className="w-[220px] px-1 py-1">
                    {timestamp.substring(0, 10) +
                      " " +
                      timestamp.substring(11, 23)}
                  </td>
                  <td className="w-auto px-1 py-1">{item.body!.stringValue}</td>
                </tr>
                {isSelected && (
                  <tr>
                    <td colSpan={3} className="px-2 bg-gray-100">
                      {item.attributes.length
                        ? item.attributes
                            .map((a) => `${a.key}: ${a.value}`)
                            .join(", ")
                        : "No additional attributes"}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
