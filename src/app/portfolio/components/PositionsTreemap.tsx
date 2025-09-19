"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Position } from "utils/types";

interface PositionsTreemapProps {
  positions: Position[];
  selectedCurrency: "EUR" | "USD";
  convert: (amount: number, fromCurrency: string, toCurrency: string) => number;
  onPositionClick?: (isin: string) => void;
}

interface TreemapData {
  name: string;
  isin: string;
  value: number;
  portfolioPercent: number;
  isMajorHolding: boolean;
}

export default function PositionsTreemap({
  positions,
  selectedCurrency,
  convert,
  onPositionClick,
}: PositionsTreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || positions.length === 0) return;

    const renderTreemap = () => {
      if (!svgRef.current) return;

      // Clear previous content
      d3.select(svgRef.current).selectAll("*").remove();

      // Filter and prepare data
      const activePositions = positions.filter((p) => p.totalShares > 0);
      if (activePositions.length === 0) return;

      const totalValue = activePositions.reduce(
        (sum, p) => sum + convert(p.currentValue || 0, "USD", selectedCurrency),
        0
      );

      const data: TreemapData[] = activePositions.map((position) => {
        const value = convert(
          position.currentValue || 0,
          "USD",
          selectedCurrency
        );
        const portfolioPercent = (value / totalValue) * 100;

        return {
          name: position.ticker || position.stockName,
          isin: position.isin,
          value,
          portfolioPercent,
          isMajorHolding: portfolioPercent > 5,
        };
      });

      // Setup dimensions
      const containerWidth = svgRef.current?.parentElement?.clientWidth || 800;
      const width = Math.max(containerWidth - 40, 600);
      const height = 600;

      // Create SVG
      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height);

      // Create treemap
      const treemap = d3
        .treemap<TreemapData>()
        .size([width, height])
        .padding(1)
        .round(true)
        .tile(d3.treemapSquarify.ratio(0.5));

      const root = d3
        .hierarchy({ name: "portfolio", children: data })
        .sum((d) => (d as any).value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      treemap(root as any);

      // Create rectangles
      const cells = svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("x", (d) => (d as any).x0)
        .attr("y", (d) => (d as any).y0)
        .attr("width", (d) => (d as any).x1 - (d as any).x0)
        .attr("height", (d) => (d as any).y1 - (d as any).y0)
        .style("fill", (d) => {
          const isin = (d.data as any).isin;
          return selectedPosition === isin ? "white" : "#111827";
        })
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style("rx", (d) => {
          const width = (d as any).x1 - (d as any).x0;
          const height = (d as any).y1 - (d as any).y0;
          // Use height/2 as max radius to prevent weird distortions
          return Math.min(height / 2, 36);
        })
        .style("ry", (d) => {
          const width = (d as any).x1 - (d as any).x0;
          const height = (d as any).y1 - (d as any).y0;
          // Use height/2 as max radius to prevent weird distortions
          return Math.min(height / 2, 36);
        })
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          const isin = (d.data as any).isin;
          setSelectedPosition(isin);
          onPositionClick?.(isin);
        });

      // Add text labels
      cells.each(function (d) {
        const rectWidth = (d as any).x1 - (d as any).x0;
        const rectHeight = (d as any).y1 - (d as any).y0;
        const x = (d as any).x0;
        const y = (d as any).y0;
        const data = d.data as any;

        if (rectWidth > 120 && rectHeight > 80) {
          addLargeTileText(
            svg,
            data,
            x,
            y,
            rectWidth,
            rectHeight,
            selectedCurrency,
            d
          );
        } else if (rectWidth > 60 && rectHeight > 40) {
          addMediumTileText(
            svg,
            data,
            x,
            y,
            rectWidth,
            rectHeight,
            selectedCurrency,
            d
          );
        } else if (rectWidth > 30 && rectHeight > 20) {
          addSmallTileText(svg, data, x, y, rectWidth, rectHeight, d);
        } else {
          addTinyTileIndicator(svg, data, x, y, rectWidth, rectHeight);
        }
      });
    };

    // Helper functions

    const addText = (
      svg: any,
      x: number,
      y: number,
      text: string,
      fontSize: number,
      fontWeight: string = "bold",
      textAnchor: string = "start",
      rectData?: any
    ) => {
      const textElement = svg
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .style(
          "fill",
          rectData
            ? selectedPosition === (rectData.data as any).isin
              ? "#111827"
              : "white"
            : "white"
        )
        .style("font-size", `${fontSize}px`)
        .style("font-weight", fontWeight)
        .style("font-family", "hagrid-text, system-ui, sans-serif")
        .style("text-anchor", textAnchor)
        .style("pointer-events", "none")
        .text(text);

      return textElement;
    };

    const addLargeTileText = (
      svg: any,
      data: TreemapData,
      x: number,
      y: number,
      rectWidth: number,
      rectHeight: number,
      currency: string,
      rectData: any
    ) => {
      const { name, value, portfolioPercent, isMajorHolding } = data;

      // Relative font sizing based on tile dimensions (non-linear scaling)
      const baseFontSize = Math.min(rectWidth, rectHeight) * 0.1;
      const fontSize = isMajorHolding ? baseFontSize * 1.2 : baseFontSize;
      const valueFontSize = fontSize * 0.8;
      const topPadding = rectHeight * 0.18;

      // Ticker
      addText(
        svg,
        x + 20,
        y + topPadding + fontSize,
        name,
        fontSize,
        "700",
        "start",
        rectData
      );

      // Value (only for positions >= 3%)
      if (portfolioPercent >= 3) {
        const valueText = `${
          currency === "EUR" ? "€" : "$"
        }${value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`;
        addText(
          svg,
          x + 20,
          y + topPadding + fontSize * 2.2,
          valueText,
          valueFontSize,
          "bold",
          "start",
          rectData
        );

        // Percentage horizontally aligned with ticker (same font size)
        addText(
          svg,
          x + rectWidth - 20,
          y + topPadding + fontSize,
          `${portfolioPercent.toFixed(1)}%`,
          fontSize,
          "bold",
          "end",
          rectData
        );
      } else {
        // Percentage below ticker for small positions (same font size)
        addText(
          svg,
          x + 20,
          y + topPadding + fontSize * 1.8,
          `${portfolioPercent.toFixed(1)}%`,
          fontSize,
          "bold",
          "start",
          rectData
        );
      }
    };

    const addMediumTileText = (
      svg: any,
      data: TreemapData,
      x: number,
      y: number,
      rectWidth: number,
      rectHeight: number,
      currency: string,
      rectData: any
    ) => {
      const { name, value, portfolioPercent, isMajorHolding } = data;

      // Relative font sizing based on tile dimensions (non-linear scaling)
      const baseFontSize = Math.min(rectWidth, rectHeight) * 0.15;
      const fontSize = isMajorHolding ? baseFontSize * 1.15 : baseFontSize;
      const valueFontSize = fontSize * 0.8;
      const topPadding = rectHeight * 0.15;

      const truncatedName = name.length > 4 ? name.substring(0, 4) : name;

      // Ticker
      addText(
        svg,
        x + 12,
        y + topPadding + fontSize,
        truncatedName,
        fontSize,
        "700",
        "start",
        rectData
      );

      // Value (only for positions >= 3%)
      if (portfolioPercent >= 3) {
        const valueText = `${
          currency === "EUR" ? "€" : "$"
        }${value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`;
        addText(
          svg,
          x + 12,
          y + topPadding + fontSize * 2.2,
          valueText,
          valueFontSize,
          "bold",
          "start",
          rectData
        );

        // Percentage horizontally aligned with ticker (same font size)
        addText(
          svg,
          x + rectWidth - 12,
          y + topPadding + fontSize,
          `${portfolioPercent.toFixed(1)}%`,
          fontSize,
          "bold",
          "end",
          rectData
        );
      } else {
        // Percentage below ticker for small positions (same font size)
        addText(
          svg,
          x + 12,
          y + topPadding + fontSize * 1.8,
          `${portfolioPercent.toFixed(1)}%`,
          fontSize,
          "bold",
          "start",
          rectData
        );
      }
    };

    const addSmallTileText = (
      svg: any,
      data: TreemapData,
      x: number,
      y: number,
      rectWidth: number,
      rectHeight: number,
      rectData: any
    ) => {
      const { name, portfolioPercent, isMajorHolding } = data;

      // Relative font sizing based on tile dimensions (non-linear scaling)
      const baseFontSize = Math.min(rectWidth, rectHeight) * 0.25;
      const fontSize = isMajorHolding ? baseFontSize * 1.05 : baseFontSize;
      const topPadding = rectHeight * 0.2;

      // Truncated ticker
      const truncatedName =
        name.length > 8 ? name.substring(0, 8) + "..." : name;
      addText(
        svg,
        x + 8,
        y + topPadding + fontSize,
        truncatedName,
        fontSize,
        "700",
        "start",
        rectData
      );

      // Percentage layout based on portfolio percentage
      if (portfolioPercent >= 3) {
        // Percentage on the right (same font size)
        addText(
          svg,
          x + rectWidth - 8,
          y + topPadding + fontSize,
          `${portfolioPercent.toFixed(0)}%`,
          fontSize,
          "bold",
          "end",
          rectData
        );
      } else {
        // Percentage below ticker for small positions (same font size)
        addText(
          svg,
          x + 8,
          y + topPadding + fontSize * 2.2,
          `${portfolioPercent.toFixed(0)}%`,
          fontSize,
          "bold",
          "start",
          rectData
        );
      }
    };

    const addTinyTileIndicator = (
      svg: any,
      data: TreemapData,
      x: number,
      y: number,
      rectWidth: number,
      rectHeight: number
    ) => {
      // Add a small colored circle (placeholder for gain/loss indicator)
      svg
        .append("circle")
        .attr("cx", x + rectWidth / 2)
        .attr("cy", y + rectHeight / 2)
        .attr("r", Math.min(rectWidth, rectHeight) / 4)
        .style("fill", "#10b981")
        .style("opacity", 0.8);
    };

    // Initial render
    renderTreemap();

    // Resize listener
    const handleResize = () => renderTreemap();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [positions, selectedCurrency, convert, onPositionClick]);

  if (positions.length === 0) {
    return <div className="text-red-500">No positions to display</div>;
  }

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
}
