import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface MonthlyGrowthChartProps {
  data: {
    date: string;
    totalMonthlyValue: number;
    currency: string;
  }[];
  selectedCurrency: string;
}

const MonthlyGrowthChart: React.FC<MonthlyGrowthChartProps> = ({
  data,
  selectedCurrency,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
    marginTop: 40,
    marginRight: 0,
    marginBottom: 40,
    marginLeft: 0,
  });

  useEffect(() => {
    if (!svgRef.current) return;

    const handleResize = () => {
      // Use full viewport width for full screen width
      const viewportWidth = window.innerWidth;
      const newWidth =
        viewportWidth -
        chartDimensions.marginLeft -
        chartDimensions.marginRight;
      // Use full viewport height minus margins and some padding
      const viewportHeight = window.innerHeight;
      const newHeight = Math.max(
        200,
        viewportHeight -
          chartDimensions.marginTop -
          chartDimensions.marginBottom -
          200 // Account for header, navigation, and other UI elements
      );

      setChartDimensions((prev) => ({
        ...prev,
        width: newWidth,
        height: newHeight,
      }));
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once to set initial dimensions

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    chartDimensions.marginLeft,
    chartDimensions.marginRight,
    chartDimensions.marginTop,
    chartDimensions.marginBottom,
  ]);

  useEffect(() => {
    if (!data || data.length === 0 || chartDimensions.width === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const mainSvg = d3
      .select(svgRef.current)
      .attr(
        "width",
        chartDimensions.width +
          chartDimensions.marginLeft +
          chartDimensions.marginRight
      )
      .attr(
        "height",
        chartDimensions.height +
          chartDimensions.marginTop +
          chartDimensions.marginBottom
      );

    // Create gradient definition in main SVG (before the translated group)
    const gradient = mainSvg
      .append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(255, 255, 255, 0.3)")
      .attr("stop-opacity", 1);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(255, 255, 255, 0)")
      .attr("stop-opacity", 0);

    const svg = mainSvg
      .append("g")
      .attr(
        "transform",
        `translate(${chartDimensions.marginLeft},${chartDimensions.marginTop})`
      );

    const parseDate = d3.timeParse("%Y-%m");
    const formattedData = data.map((d) => ({
      date: parseDate(d.date) as Date,
      totalMonthlyValue: d.totalMonthlyValue,
      currency: d.currency,
    }));

    // Sort data by date
    formattedData.sort((a, b) => a.date.getTime() - b.date.getTime());

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(formattedData, (d) => d.date) as [Date, Date])
      .range([0, chartDimensions.width]);

    // Calculate a nice round number close to the max value (use full chart height)
    const maxValue = d3.max(formattedData, (d) => d.totalMonthlyValue) || 0;
    const niceMaxValue = (() => {
      if (maxValue === 0) return 100;
      // Add minimal padding (5%) and round to a nice number that's close
      const paddedMax = maxValue * 1.05; // Only 5% padding
      const magnitude = Math.pow(10, Math.floor(Math.log10(paddedMax)));
      const normalized = paddedMax / magnitude;
      let rounded;
      // Round to the closest nice number, not always up
      if (normalized <= 1.1) rounded = 1;
      else if (normalized <= 1.5) rounded = 1.5;
      else if (normalized <= 2) rounded = 2;
      else if (normalized <= 3) rounded = 3;
      else if (normalized <= 5) rounded = 5;
      else rounded = Math.ceil(normalized);
      return rounded * magnitude;
    })();

    const yScale = d3
      .scaleLinear()
      .domain([0, niceMaxValue])
      .range([chartDimensions.height, 0]);

    // Add X-axis with lowercase month abbreviations
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];

    // Create a map of dates to their formatted labels
    const tickLabels = new Map<string, string>();
    let prevYear: number | null = null;

    // Pre-calculate labels for all ticks
    const ticks = xScale.ticks();
    ticks.forEach((date) => {
      const month = date.getMonth();
      const year = date.getFullYear();
      const dateKey = date.getTime().toString();

      // Show year when it changes or for January
      if (prevYear === null || prevYear !== year || month === 0) {
        prevYear = year;
        tickLabels.set(dateKey, year.toString());
      } else {
        tickLabels.set(dateKey, monthNames[month]);
      }
    });

    // Create x-axis and get tick positions
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => {
      const date = d as Date;
      return (
        tickLabels.get(date.getTime().toString()) || monthNames[date.getMonth()]
      );
    });

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${chartDimensions.height})`)
      .call(xAxis);

    // Remove only the tick lines (small indication lines), keep the bottom axis line
    xAxisGroup.selectAll("line").remove();

    // Keep the axis path (the main bottom line) but style it
    xAxisGroup
      .selectAll("path")
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-width", 1);

    xAxisGroup
      .selectAll("text")
      .style("fill", "rgba(255, 255, 255, 0.6)")
      .style("font-size", "16px")
      .style("font-family", "var(--font-space-mono), 'Space Mono', monospace")
      .style("text-transform", "lowercase")
      .attr("text-anchor", "middle"); // Center text on tick marks for edge labels

    // Get x-axis tick positions for vertical lines
    const xTickPositions = xScale.ticks().map((d) => xScale(d));

    // Add vertical grid lines at x-axis tick positions
    svg
      .selectAll(".vertical-grid-line")
      .data(xTickPositions)
      .enter()
      .append("line")
      .attr("class", "vertical-grid-line")
      .attr("x1", (d) => d)
      .attr("x2", (d) => d)
      .attr("y1", 0)
      .attr("y2", chartDimensions.height)
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-width", 1);

    // Calculate average spacing between vertical lines to create square grid
    let verticalSpacing = chartDimensions.width;
    if (xTickPositions.length > 1) {
      const spacings: number[] = [];
      for (let i = 1; i < xTickPositions.length; i++) {
        spacings.push(xTickPositions[i] - xTickPositions[i - 1]);
      }
      verticalSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
    }

    // Add horizontal grid lines to create squares with vertical lines
    const numHorizontalLines = Math.ceil(
      chartDimensions.height / verticalSpacing
    );
    const horizontalPositions = Array.from(
      { length: numHorizontalLines + 1 },
      (_, i) => i * verticalSpacing
    ).filter((y) => y <= chartDimensions.height);

    svg
      .selectAll(".horizontal-grid-line")
      .data(horizontalPositions)
      .enter()
      .append("line")
      .attr("class", "horizontal-grid-line")
      .attr("x1", 0)
      .attr("x2", chartDimensions.width)
      .attr("y1", (d) => d)
      .attr("y2", (d) => d)
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-width", 1);

    // Add Y-axis with only one label at the top (max value)
    const formatLabel = (value: number) => {
      // Format as abbreviated number (e.g., 1M, 500K, etc.)
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
      }
      return value.toString();
    };

    // Add only the top label (max value) inside the chart
    svg
      .append("text")
      .attr("x", 4) // Position text 4px to the right of the axis line (reduced for edge-to-edge)
      .attr("y", 0)
      .attr("dy", "0.71em") // Align with top
      .style("fill", "rgba(255, 255, 255, 0.6)")
      .style("font-size", "16px")
      .style("font-family", "var(--font-space-mono), 'Space Mono', monospace")
      .text(formatLabel(niceMaxValue));

    // Add subtle Y-axis line (no ticks, just the line)
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", chartDimensions.height)
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-width", 1);

    // Create area generator for filled area beneath the line
    const area = d3
      .area<{
        date: Date;
        totalMonthlyValue: number;
        currency: string;
      }>()
      .x((d) => xScale(d.date))
      .y0(chartDimensions.height)
      .y1((d) => yScale(d.totalMonthlyValue));

    // Add the filled area with gradient
    svg
      .append("path")
      .datum(formattedData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Add the white line
    const line = d3
      .line<{
        date: Date;
        totalMonthlyValue: number;
        currency: string;
      }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.totalMonthlyValue));

    svg
      .append("path")
      .datum(formattedData)
      .attr("fill", "none")
      .attr("stroke", "#FFFFFF") // White color for the line
      .attr("stroke-width", 3) // Thicker line
      .attr("d", line);

    // Add tooltips
    const tooltip = d3.select(tooltipRef.current);

    const focus = svg
      .append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle").attr("r", 5).style("fill", "#FFFFFF");
    focus.append("line").attr("class", "x-hover-line hover-line");
    focus.append("line").attr("class", "y-hover-line hover-line");

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", chartDimensions.width)
      .attr("height", chartDimensions.height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        focus.style("display", null);
        tooltip.style("display", null);
      })
      .on("mouseout", () => {
        focus.style("display", "none");
        tooltip.style("display", "none");
      })
      .on("mousemove", mousemove);

    function mousemove(event: MouseEvent) {
      const x0 = xScale.invert(d3.pointer(event)[0]);
      const bisectDate = d3.bisector((d: { date: Date }) => d.date).left;
      const i = bisectDate(formattedData, x0, 1);
      const d0 = formattedData[i - 1];
      const d1 = formattedData[i];
      const d =
        x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime()
          ? d1
          : d0;

      focus.attr(
        "transform",
        `translate(${xScale(d.date)},${yScale(d.totalMonthlyValue)})`
      );
      focus
        .select(".x-hover-line")
        .attr("x1", 0)
        .attr("x2", -xScale(d.date))
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "rgba(255, 255, 255, 0.3)")
        .attr("stroke-dasharray", "3,3");

      focus
        .select(".y-hover-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", chartDimensions.height - yScale(d.totalMonthlyValue))
        .attr("stroke-width", 1)
        .attr("stroke", "rgba(255, 255, 255, 0.3)")
        .attr("stroke-dasharray", "3,3");

      // Calculate position above the point on the line
      const pointX = xScale(d.date);
      const pointY = yScale(d.totalMonthlyValue);

      // Get SVG position relative to viewport
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      // Calculate tooltip position above the point (centered horizontally, positioned above)
      // Use fixed positioning with viewport coordinates
      const tooltipX = svgRect.left + chartDimensions.marginLeft + pointX;
      const tooltipY = svgRect.top + chartDimensions.marginTop + pointY;

      tooltip
        .html(
          `
          <div style="padding: 12px 16px; border-radius: 16px; background-color: #292929; color: #F3F4F6; font-family: var(--font-space-mono), 'Space Mono', monospace; border: 2px solid white;">
            <div style="font-size: 14px; color: white; margin-bottom: 4px; font-weight: 500;">
              ${d3.timeFormat("%B %Y")(d.date)}
            </div>
            <div style="font-size: 20px; font-weight: 600; color: #E1FF8E;">
              ${d.totalMonthlyValue.toLocaleString("en-US", {
                style: "currency",
                currency: selectedCurrency,
              })}
            </div>
          </div>
          `
        )
        .style("position", "fixed")
        .style("left", `${tooltipX}px`)
        .style("top", `${tooltipY}px`)
        .style("transform", "translate(-50%, calc(-100% - 15px))") // Center horizontally and position 15px above the point
        .style("z-index", "1000")
        .style("pointer-events", "none");
    }

    // Add some basic styling for the hover lines
    d3.select(svgRef.current).append("style").text(`
      .hover-line {
        stroke: rgba(255, 255, 255, 0.3);
        stroke-width: 1px;
        stroke-dasharray: 3,3;
      }
    `);
  }, [data, selectedCurrency, chartDimensions]);

  return (
    <div className="flex flex-col relative w-full" style={{ width: "100vw" }}>
      <h2 className="text-4xl font-bold text-white font-[hagrid] mb-4 px-0">
        Monthly Portfolio Value
      </h2>
      <div className="relative w-full">
        <svg
          ref={svgRef}
          style={{
            display: "block",
            width: "100%",
            height: `${
              chartDimensions.height +
              chartDimensions.marginTop +
              chartDimensions.marginBottom
            }px`,
          }}
        ></svg>
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            pointerEvents: "none",
            display: "none",
          }}
        ></div>
      </div>
    </div>
  );
};

export default MonthlyGrowthChart;
