"use client";

import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { ILogRecord } from "@opentelemetry/otlp-transformer";

type HistogramProps = {
  width: number;
  height: number;
  data: Array<ILogRecord>; // nanos
};

const XAXIS_HEIGHT = 40;
const YAXIS_WIDTH = 40;

export const Histogram = ({ width, height, data }: HistogramProps) => {
  // Use ref for the future addition of axis
  const svgRef = useRef<SVGSVGElement | null>(null);

  const dateData = useMemo(
    () => data.map((d) => new Date((d.timeUnixNano as number) / 10e5)),
    [data],
  );

  const xScale = useMemo(() => {
    const extent = d3.extent(dateData) as [Date, Date];

    return d3
      .scaleTime()
      .domain([extent[0], extent[1]])
      .range([YAXIS_WIDTH, width - YAXIS_WIDTH]);
  }, [dateData, width]);

  // Create bins corresponding to calendar days (1 bin per day)
  const buckets = useMemo(() => {
    return d3
      .bin<Date, Date>()
      .value((d) => d)
      .domain(d3.extent(dateData) as [Date, Date])
      .thresholds(d3.timeDays(d3.min(dateData)!, d3.max(dateData)!))(dateData);
  }, [dateData]);

  const yScale = useMemo(() => {
    // Stretch the range to be whatever the tallest bar is
    const max = Math.max(...buckets.map((bucket) => bucket.length));
    return d3.scaleLinear().range([height, 5]).domain([0, max]);
  }, [buckets, height]);

  // X Axis
  useEffect(() => {
    if (svgRef.current) {
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(d3.timeDay.every(4))
        .tickFormat((d: Date | d3.NumberValue) =>
          d3.timeFormat("%b %d, %Y")(d as Date),
        );

      d3.select(svgRef.current)
        .select<SVGGElement>(".x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
    }
  }, [xScale, height]);

  // Y Axis
  useEffect(() => {
    if (svgRef.current) {
      const yAxis = d3.axisLeft(yScale).ticks(5); // Adjust number of ticks as needed

      d3.select(svgRef.current)
        .select<SVGGElement>(".y-axis")
        .attr("transform", `translate(${YAXIS_WIDTH}, 0)`) // Position y-axis on the left
        .call(yAxis);
    }
  }, [yScale]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height + XAXIS_HEIGHT /* Extra space for axis labels */}
    >
      {buckets.map((bucket, i) => {
        return (
          <rect
            key={i}
            fill="#D2E3FC"
            stroke="#1973E8"
            x={xScale(bucket.x0!)}
            width={xScale(bucket.x1!) - xScale(bucket.x0!)}
            y={yScale(bucket.length)}
            height={height - yScale(bucket.length)}
          />
        );
      })}

      {/* Placeholder for X Axis */}
      <g className="x-axis" />

      {/* Placeholder for Y Axis */}
      <g className="y-axis" />
    </svg>
  );
};
