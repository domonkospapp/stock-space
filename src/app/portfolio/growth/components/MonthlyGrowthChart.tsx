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
    marginTop: 20,
    marginRight: 30,
    marginBottom: 60,
    marginLeft: 80,
  });

  useEffect(() => {
    if (!svgRef.current) return;

    const handleResize = () => {
      const parentWidth = svgRef.current?.parentElement?.clientWidth || 800; // Default width
      const newWidth =
        parentWidth - chartDimensions.marginLeft - chartDimensions.marginRight;
      const newHeight = Math.max(200, newWidth * 0.5); // Maintain aspect ratio, minimum height 200

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
  }, [chartDimensions.marginLeft, chartDimensions.marginRight]);

  useEffect(() => {
    if (!data || data.length === 0 || chartDimensions.width === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
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
      )
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

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(formattedData, (d) => d.totalMonthlyValue) || 0])
      .nice()
      .range([chartDimensions.height, 0]);

    // Add X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${chartDimensions.height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m")))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "#9CA3AF"); // Light gray for axis labels

    // Add Y-axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale).tickFormat((d) => d3.format("~s")(d)))
      .selectAll("text")
      .style("fill", "#9CA3AF"); // Light gray for axis labels

    // Add Y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chartDimensions.marginLeft + 20)
      .attr("x", 0 - chartDimensions.height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#F3F4F6") // White color
      .text(`Total Value (${selectedCurrency})`);

    // Add the line
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
      .attr("stroke", "#34D399") // Green color for the line
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add tooltips
    const tooltip = d3.select(tooltipRef.current);

    const focus = svg
      .append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle").attr("r", 5).style("fill", "#34D399");
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
      const d = x0 - d0.date.getTime() > d1.date.getTime() - x0 ? d1 : d0;

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
        .attr("stroke", "#9CA3AF")
        .attr("stroke-dasharray", "3,3");

      focus
        .select(".y-hover-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", chartDimensions.height - yScale(d.totalMonthlyValue))
        .attr("stroke-width", 1)
        .attr("stroke", "#9CA3AF")
        .attr("stroke-dasharray", "3,3");

      tooltip
        .html(
          `
          <div style="padding: 8px; border-radius: 4px; background-color: #374151; color: #F3F4F6; font-family: 'Urbanist', sans-serif;">
            <strong>Month:</strong> ${d3.timeFormat("%Y-%m")(d.date)}<br/>
            <strong>Value:</strong> ${d.totalMonthlyValue.toLocaleString(
              "en-US",
              {
                style: "currency",
                currency: selectedCurrency,
              }
            )}
          </div>
          `
        )
        .style("left", `${event.pageX + 15}px`)
        .style("top", `${event.pageY - 28}px`);
    }

    // Add some basic styling for the hover lines (can be moved to CSS)
    d3.select(svgRef.current).append("style").text(`
      .hover-line {
        stroke: #9CA3AF;
        stroke-width: 1px;
        stroke-dasharray: 3,3;
      }
    `);
  }, [data, selectedCurrency, chartDimensions]);

  return (
    <div className="flex flex-col p-4 bg-dark-blue rounded-lg">
      {/* <h2 className="text-xl font-bold text-white mb-4">
        Monthly Portfolio Value
      </h2> */}
      <h2 className="text-4xl font-bold text-white font-[hagrid]">
        Monthly Portfolio Value
      </h2>
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
        style={{ position: "absolute", pointerEvents: "none", display: "none" }}
      ></div>
    </div>
  );
};

export default MonthlyGrowthChart;
