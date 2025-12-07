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
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
    marginTop: 40,
    marginRight: 0,
    marginBottom: 40,
    marginLeft: 0,
  });
  const [hoveredData, setHoveredData] = useState<{
    date: Date;
    value: number;
  } | null>(null);

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
    // Parse dates and ensure they're at the start of each month
    const formattedData = data.map((d) => {
      const parsedDate = parseDate(d.date) as Date;
      // Ensure the date is at the start of the month (day 1)
      const dateAtStartOfMonth = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        1
      );
      return {
        date: dateAtStartOfMonth,
        totalMonthlyValue: d.totalMonthlyValue,
        currency: d.currency,
      };
    });

    // Sort data by date
    formattedData.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Get the extent from original data to determine the range
    const [minDate, maxDate] = d3.extent(formattedData, (d) => d.date) as [
      Date,
      Date
    ];

    // Create temporary scale to determine tick interval and first tick position
    const tempScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([0, chartDimensions.width]);

    const tempTicks = tempScale.ticks();

    // Determine the labeling resolution (interval between labels in months)
    let labelIntervalMonths = 1; // Default to 1 month
    if (tempTicks.length > 1) {
      const firstTick = tempTicks[0];
      const secondTick = tempTicks[1];
      const monthsDiff =
        (secondTick.getFullYear() - firstTick.getFullYear()) * 12 +
        (secondTick.getMonth() - firstTick.getMonth());
      labelIntervalMonths = monthsDiff;
    }

    // Calculate the start date: extend backwards to align with labeling interval
    // This ensures no half squares at the beginning
    const firstTickDate = tempTicks[0] || minDate;
    const tickBasedStartDate = new Date(
      firstTickDate.getFullYear(),
      firstTickDate.getMonth(),
      1
    );

    // Find the start of the interval that contains minDate
    // Extend backwards by the labeling interval to ensure full squares
    const minDateMonth = minDate.getMonth();
    const minDateYear = minDate.getFullYear();

    // Calculate how many months into the interval the minDate falls
    // We need to find which interval (of labelIntervalMonths) contains minDate
    // and extend back to the start of that interval
    const monthsFromEpoch = minDateYear * 12 + minDateMonth;
    const intervalStartMonths =
      Math.floor(monthsFromEpoch / labelIntervalMonths) * labelIntervalMonths;
    const intervalStartYear = Math.floor(intervalStartMonths / 12);
    const intervalStartMonth = intervalStartMonths % 12;

    const intervalStartDate = new Date(
      intervalStartYear,
      intervalStartMonth,
      1
    );

    // Use the earlier of tick-based start, interval start, or actual minDate
    const startDate = [
      tickBasedStartDate,
      intervalStartDate,
      new Date(minDateYear, minDateMonth, 1),
    ].sort((a, b) => a.getTime() - b.getTime())[0];

    // Fill in missing months with zero values from startDate to maxDate
    const filledData: typeof formattedData = [];
    if (formattedData.length > 0) {
      // Create a map of existing data by month key
      const dataMap = new Map<string, (typeof formattedData)[0]>();
      formattedData.forEach((d) => {
        const monthKey = `${d.date.getFullYear()}-${d.date.getMonth()}`;
        dataMap.set(monthKey, d);
      });

      // Fill in all months from startDate to maxDate
      const currentDate = new Date(startDate);
      const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

      while (currentDate <= endDate) {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        const existingData = dataMap.get(monthKey);

        if (existingData) {
          filledData.push(existingData);
        } else {
          // Add zero value for missing month (before investing started)
          filledData.push({
            date: new Date(currentDate),
            totalMonthlyValue: 0,
            currency: formattedData[0]?.currency || "",
          });
        }

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Sort filled data by date to ensure chronological order
      filledData.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      filledData.push(...formattedData);
    }

    // Use filledData directly (it already includes zeros from startDate)
    const dataWithStart = filledData;

    const xScale = d3
      .scaleTime()
      .domain([startDate, maxDate])
      .range([0, chartDimensions.width]);

    // Calculate the actual max value from data
    const maxValue = d3.max(dataWithStart, (d) => d.totalMonthlyValue) || 0;

    // Create initial Y scale (will be updated after we calculate spacing to complete last square)
    let yScale = d3
      .scaleLinear()
      .domain([0, maxValue || 100])
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

    const xAxisTexts = xAxisGroup.selectAll("text");

    xAxisTexts
      .style("fill", "rgba(255, 255, 255, 0.6)")
      .style("font-size", "20px")
      .style("font-family", "var(--font-space-mono), 'Space Mono', monospace")
      .style("text-transform", "lowercase")
      .attr("text-anchor", "middle") // Center text on tick marks for edge labels
      .style("font-weight", function () {
        // Make bold except for month names (lowercase month abbreviations)
        const text = d3.select(this).text();
        const isMonthName =
          /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/.test(
            text.toLowerCase()
          );
        return isMonthName ? "normal" : "bold";
      });

    // Remove the first label
    if (xAxisTexts.size() > 0) {
      const firstNode = xAxisTexts.nodes()[0];
      if (firstNode && firstNode instanceof Element) {
        firstNode.remove();
      }
    }

    // Calculate spacing based on labeling interval to create perfect squares
    // Start from 0, not from the first tick position
    const allTicks = xScale.ticks();
    const xTickPositions = allTicks.map((d) => xScale(d));

    // Determine the spacing - always use distance from 0 to first tick
    // This ensures squares start from the left edge
    let verticalSpacing = chartDimensions.width;
    if (xTickPositions.length > 0) {
      const firstTickPos = xTickPositions[0];
      // Use the distance from 0 to the first tick as the square width
      // If first tick is at 0, use spacing between ticks instead
      if (firstTickPos > 0) {
        verticalSpacing = firstTickPos;
      } else if (xTickPositions.length > 1) {
        // If first tick is at 0, use spacing between first two ticks
        verticalSpacing = xTickPositions[1] - xTickPositions[0];
      }
    }

    // Safety check: ensure verticalSpacing is valid and reasonable
    if (
      verticalSpacing <= 0 ||
      !isFinite(verticalSpacing) ||
      verticalSpacing > chartDimensions.width
    ) {
      // Fallback: create a reasonable number of squares
      verticalSpacing = chartDimensions.width / 10;
    }

    // Create evenly spaced vertical lines starting from 0
    // Calculate how many complete squares fit in the width
    const numCompleteSquares = Math.max(
      1,
      Math.floor(chartDimensions.width / verticalSpacing)
    );
    const verticalPositions: number[] = [];

    // Always start at 0
    verticalPositions.push(0);

    // Add lines at each square interval
    for (let i = 1; i <= numCompleteSquares; i++) {
      const pos = i * verticalSpacing;
      if (pos < chartDimensions.width && isFinite(pos)) {
        verticalPositions.push(pos);
      }
    }

    // Always end at the right edge (avoid duplicates)
    const lastPos = verticalPositions[verticalPositions.length - 1];
    if (lastPos < chartDimensions.width - 0.1) {
      verticalPositions.push(chartDimensions.width);
    }

    // Vertical lines will be drawn after horizontal positions are calculated
    // so we can use the topmost horizontal line position

    // Calculate Y-axis max to ensure complete squares from bottom (0) to top
    // Strategy: Position maxValue inside a square (one square down from top)
    // The Y-axis label will show yAxisMax at the top, which is slightly above maxValue
    let yAxisMax = maxValue || 100;
    let yAxisLabelValue = maxValue || 100;

    if (
      maxValue > 0 &&
      verticalSpacing > 0 &&
      isFinite(verticalSpacing) &&
      chartDimensions.height > 0
    ) {
      // We want maxValue to be positioned one square down from the top
      // This ensures it sits inside a complete square, not at the top edge
      // Top edge (y=0) will show yAxisMax
      // One square down (y=verticalSpacing) will show maxValue
      const maxValuePosition = verticalSpacing;

      // Y scale: yPos = height - (value / yAxisMax) * height
      // At maxValuePosition: maxValuePosition = height - (maxValue / yAxisMax) * height
      // Solving: yAxisMax = maxValue * height / (height - maxValuePosition)
      // Since maxValuePosition = verticalSpacing:
      // yAxisMax = maxValue * height / (height - verticalSpacing)

      const denominator = chartDimensions.height - verticalSpacing;
      if (denominator > 0 && verticalSpacing < chartDimensions.height) {
        yAxisMax = (maxValue * chartDimensions.height) / denominator;
        // The Y-axis label shows the value at the top (y=0), which is yAxisMax
        // This is slightly above maxValue, completing the top square
        yAxisLabelValue = yAxisMax;
      } else {
        yAxisMax = maxValue * 1.1;
        yAxisLabelValue = yAxisMax;
      }
    }

    // Update Y scale with the calculated max
    yScale = d3
      .scaleLinear()
      .domain([0, yAxisMax])
      .range([chartDimensions.height, 0]);

    // Draw horizontal grid lines to create perfect squares
    // Calculate from bottom (height) upward to ensure even spacing
    const numCompleteHorizontalSquares = Math.floor(
      chartDimensions.height / verticalSpacing
    );
    const horizontalPositions: number[] = [];

    // Start from bottom (height) and work upward
    // This ensures the bottom square is the same height as all others
    for (let i = 0; i <= numCompleteHorizontalSquares; i++) {
      const pos = chartDimensions.height - i * verticalSpacing;
      if (pos >= 0 && isFinite(pos)) {
        horizontalPositions.push(pos);
      }
    }

    // Remove duplicates and ensure we don't have lines too close together
    // Sort first, then filter out positions that are within 0.5 pixels of each other
    horizontalPositions.sort((a, b) => a - b);

    // Filter out duplicates and very close positions
    const filteredPositions: number[] = [];
    for (let i = 0; i < horizontalPositions.length; i++) {
      const pos = horizontalPositions[i];
      // Check if this position is far enough from the last one
      if (
        filteredPositions.length === 0 ||
        Math.abs(pos - filteredPositions[filteredPositions.length - 1]) > 0.5
      ) {
        filteredPositions.push(pos);
      }
    }

    // Use filtered positions
    horizontalPositions.length = 0;
    horizontalPositions.push(...filteredPositions);

    // Get the topmost horizontal line position (smallest y value)
    const topmostHorizontalLine =
      horizontalPositions.length > 0 ? Math.min(...horizontalPositions) : 0;

    // Add vertical grid lines - only from topmost horizontal line to bottom
    svg
      .selectAll(".vertical-grid-line")
      .data(verticalPositions)
      .enter()
      .append("line")
      .attr("class", "vertical-grid-line")
      .attr("x1", (d) => d)
      .attr("x2", (d) => d)
      .attr("y1", topmostHorizontalLine)
      .attr("y2", chartDimensions.height)
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-width", 1);

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
      // Round to a nice whole number first
      let roundedValue = value;
      if (value >= 1000000) {
        // Round to nearest 100K for millions
        roundedValue = Math.ceil(value / 100000) * 100000;
      } else if (value >= 1000) {
        // Round to nearest 10K for thousands
        roundedValue = Math.ceil(value / 10000) * 10000;
      } else {
        // Round to nearest 100 for smaller numbers
        roundedValue = Math.ceil(value / 100) * 100;
      }

      // Format as abbreviated number (e.g., 1M, 500K, etc.)
      if (roundedValue >= 1000000) {
        return `${(roundedValue / 1000000).toFixed(
          roundedValue >= 10000000 ? 0 : 1
        )}M`;
      } else if (roundedValue >= 1000) {
        return `${(roundedValue / 1000).toFixed(
          roundedValue >= 10000 ? 0 : 1
        )}K`;
      }
      return roundedValue.toString();
    };

    // Add only the top label (max value) inside the chart
    svg
      .append("text")
      .attr("x", 12) // More left padding (increased from 4px to 12px)
      .attr("y", 0)
      .attr("dy", "0.71em") // Align with top
      .style("fill", "rgba(255, 255, 255, 0.6)")
      .style("font-size", "40px")
      .style("font-family", "var(--font-space-mono), 'Space Mono', monospace")
      .style("font-weight", "bold")
      .text(formatLabel(yAxisLabelValue));

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
      .datum(dataWithStart)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Add the white line with linear interpolation (explicit)
    const line = d3
      .line<{
        date: Date;
        totalMonthlyValue: number;
        currency: string;
      }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.totalMonthlyValue))
      .curve(d3.curveLinear); // Explicitly set linear interpolation

    svg
      .append("path")
      .datum(dataWithStart)
      .attr("fill", "none")
      .attr("stroke", "#FFFFFF") // White color for the line
      .attr("stroke-width", 3) // Thicker line
      .attr("d", line);

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
      })
      .on("mouseout", () => {
        focus.style("display", "none");
        setHoveredData(null);
      })
      .on("mousemove", mousemove);

    function mousemove(event: MouseEvent) {
      const x0 = xScale.invert(d3.pointer(event)[0]);
      const bisectDate = d3.bisector((d: { date: Date }) => d.date).left;
      const i = bisectDate(dataWithStart, x0, 1);
      const d0 = dataWithStart[i - 1];
      const d1 = dataWithStart[i];
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

      // Update hovered data state instead of showing tooltip
      setHoveredData({
        date: d.date,
        value: d.totalMonthlyValue,
      });
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
      <div className="relative w-full" style={{ position: "relative" }}>
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
      </div>

      {/* Fixed display for month and value - positioned below main money value at top right */}
      {hoveredData && (
        <div
          style={{
            position: "fixed",
            top: "180px", // Position a bit below on the grid
            left: "2rem", // Match layout's p-8 padding
            right: "2rem", // Match layout's p-8 padding
            width: "auto",
            maxWidth: "80rem", // max-w-7xl (80rem = 1280px)
            marginLeft: "auto",
            marginRight: "auto",
            zIndex: 10,
            pointerEvents: "none", // Allow clicks to pass through
          }}
        >
          <div
            className="flex items-start justify-between"
            style={{ width: "100%" }}
          >
            <div style={{ flex: 1 }}></div>
            {/* Right side - matches PortfolioTotalValue position */}
            <div
              style={{
                pointerEvents: "auto",
              }}
            >
              <div className="flex gap-3">
                {/* Month box */}
                <div
                  className="px-8 py-1 rounded-2xl border-2 bg-[#292929]"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.3)", // Off-white border
                    minWidth: "280px", // Prevent jumping, increased for larger text
                  }}
                >
                  <div
                    className="text-white font-[hagrid] text-center"
                    style={{
                      fontSize: "28px",
                      fontWeight: 500,
                    }}
                  >
                    {d3.timeFormat("%B %Y")(hoveredData.date)}
                  </div>
                </div>

                {/* Value box */}
                <div
                  className="px-8 py-1 rounded-2xl border-2 bg-[#292929]"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.3)", // Off-white border
                    minWidth: "280px", // Prevent jumping, increased for larger text
                  }}
                >
                  <div
                    className="text-white font-[hagrid] text-center"
                    style={{
                      fontSize: "28px",
                      fontWeight: 500,
                    }}
                  >
                    {Math.ceil(hoveredData.value).toLocaleString("en-US", {
                      style: "currency",
                      currency: selectedCurrency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyGrowthChart;
