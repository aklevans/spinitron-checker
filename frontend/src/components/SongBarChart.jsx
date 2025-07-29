import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";


const SongBarChart = ({ data, filterArtist }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [count, setCount] = useState(10);

  useEffect(() => {
    const renderChart = () => {
      const containerWidth = wrapperRef.current?.getBoundingClientRect().width || 700;

      const counts = d3.rollup(
        data,
        v => v.length,
        d => d.artist
      );

      var formattedData = Array.from(counts, ([artist, count]) => ({ artist, count }));
      formattedData = formattedData
        .sort((a, b) => d3.descending(a.count, b.count))
        .slice(0, count); // 3. Take top 10 artists

      const margin = { top: 20, right: 20, bottom: 20, left: 200 };
      const width = containerWidth - margin.left - margin.right;
      const barHeight = 35;
      const height = barHeight * formattedData.length;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const chart = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.count)])
        .nice()
        .range([0, width]);

      const y = d3.scaleBand()
        .domain(formattedData.map(d => d.artist))
        .range([0, height])
        .padding(0.2);

      chart.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "13px")
        .on("click", (event, d) =>  filterArtist(d));

      chart.selectAll("rect")
        .data(formattedData)
        .enter()
        .append("rect")
        .attr("y", d => y(d.artist))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.count))
        .attr("fill", "#6090b8")
        .on("click", (event, d) => filterArtist(d.artist))
        .on("mouseover", function () {
          d3.select(this)
            .attr("stroke", "#3674a8")
            .attr("stroke-width", 3)
            .attr("fill", "#3674a8");
        })
        .on("mouseout", function () {
          d3.select(this)
            .attr("stroke", "none")
            .attr("fill", "#6090b8");
        });

      chart.selectAll(".label")
        .data(formattedData)
        .enter()
        .append("text")
        .attr("x", d => x(d.count) + 5)
        .attr("y", d => y(d.artist) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("fill", "black")
        .attr("font-size", "12px")
        .text(d => d.count);
    };

  renderChart();

  // Optional: rerun on window resize
  const handleResize = () => renderChart();
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);

      


  }, [data, count]);

  function seeMore() {
    setCount(count + 10);
  }

  function seeLess() {
    setCount(10);
    window.scrollTo(0, 0);
  }

  return (
    <div className="d-flex flex-column" ref={wrapperRef}>
      <svg ref={svgRef}></svg>
      <div className="d-flex">
        <a className="m-1" onClick={seeMore}>+ see more</a>
        {count > 10? <a className="m-1" onClick={seeLess}>- see less</a> : null}
      </div>

    </div>
  );
};

export default SongBarChart;
