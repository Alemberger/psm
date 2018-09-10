(function() {
  "use strict";

  function formatStatus(status) {
    return {
      NotStarted: "Not Started",
      InProgress: "In Progress",
      Completed: "Completed",
      Ongoing: "Ongoing"
    }[status];
  }

  function makeFeatureTable(targetSelector, reqsData, issuesData) {
    var table = d3
      .select(targetSelector)
      .append("table")
      .attr("class", "requirementsTable");
    var thead = table.append("thead");
    var tbody = table.append("tbody");

    var columns = [
      { label: "ID", key: "req_id" },
      { label: "Description", key: "description" },
      // Status of requirements is not currently implemented.
      // { label: "Status", key: "status" },
      { label: "Issue Tickets", key: "issues" }
    ];

    // Header row.
    thead
      .append("tr")
      .selectAll("th")
      .data(
        columns.map(function(c) {
          return c.label;
        })
      )
      .enter()
      .append("th")
      .attr("class", "requirementsTableCell")
      .text(function(column) {
        return column;
      });

    // Data rows.
    var rows = tbody
      .selectAll("tr")
      .data(reqsData)
      .enter()
      .append("tr");

    // Cells.
    function plainValue(d) {
      return d.value;
    }

    function formatRequirementStatus(d) {
      return formatStatus(d.value);
    }

    function formatIssues(d) {
      if (!Array.isArray(d.value)) {
        return d.value;
      }
      d.value.sort(function(a, b) {
        return a > b;
      });
      var links = d.value.map(function(issueNumber) {
        var issue = issuesData[issueNumber];
        var classes =
          issue.status === "Completed" ? "completedIssueLink" : "issueLink";

        return (
          '<a href="' +
          issue.url +
          '" title="' +
          issue.title +
          '" class="' +
          classes +
          '" >' +
          issueNumber +
          "</a>"
        );
      });
      return links.join(", ");
    }

    function cellClass(d) {
      return (
        "requirementsTableCell " +
        {
          req_id: "reqIdCell",
          description: "descriptionCell",
          status: "statusCell",
          issues: "issuesCell"
        }[d.key]
      );
    }

    var cells = rows
      .selectAll("td")
      .data(function(row) {
        return columns.map(function(column) {
          if (!row) {
            console.error("Failed to get data for a row")
          }
          return {
            key: column.key,
            value: row ? row[column.key] : "[Error]"
          };
        });
      })
      .enter()
      .append("td")
      .attr("class", cellClass)
      .html(function(d) {
        var formatter = {
          req_id: plainValue,
          description: plainValue,
          status: formatRequirementStatus,
          issues: formatIssues
        }[d.key];

        return formatter(d);
      });

    return table;
  }

  function sortFeatures(a, b) {
    // Ongoing features are last in the sort order.
    if (a.status === "Ongoing" && b.status !== "Ongoing") {
      return 1;
    } else if (b.status === "Ongoing" && a.status !== "Ongoing") {
      return -1;
    } else if (a.completedDate === b.completedDate) {
      return a.startDate > b.startDate ? 1 : -1;
    } else {
      return a.completedDate > b.completedDate ? 1 : -1;
    }
  }

  // Return the number of issues linked to the reqs
  // linked to a given feature. If a given issue is
  // linked to more than one req, only count it once.
  function countIssues(data, feature) {
    var issues = {};
    feature.requirements.forEach(
      function(reqId) {
        var req = data.requirements[reqId];
        req.issues.forEach(
          function(issueId) {
            issues[issueId] = true;
          }
        );
      }
    );
    return Object.keys(issues).length;
  }

  window.drawFeaturesBurnDownChart = function(data, d3) {
    var globalStartDate = new Date("2017-04-01");
    var globalEndDate = new Date("2019-09-30");
    var todayDate = new Date();
    var todayString = todayDate.toISOString();

    var chartEl = d3.select("#burn-down-chart");
    if (!chartEl.selectAll("*").empty()) {
      chartEl.selectAll("*").remove();
    }
    if (!d3.select(".darkBackground").empty()) {
      d3.select(".darkBackground").remove();
    }
    var width = +chartEl.style("width").replace(/(px)/g, "");
    var height = +chartEl.style("height").replace(/(px)/g, "");

    var root = d3
      .select("#burn-down-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var yAxisWidth = 15;
    var xAxisTopHeight = 65;
    var xAxisBottomHeight = 90;

    // Define the root g element.
    var chartWidth = width - yAxisWidth;
    var chartHeight = height - xAxisTopHeight - xAxisBottomHeight;
    var chartG = root
      .append("g")
      .attr("class", "histo")
      .attr("transform", "translate(" + yAxisWidth + ", 0)");

    // features data in array form
    var featuresArray = Object.keys(data.features)
      .map(function(key) {
        var feature = data.features[key];
        // TODO: calculate 'in progress' percent done
        feature.percentDone =
          {
            NotStarted: "0",
            Completed: "100"
          }[feature.status] || "50";

        feature.issueCount = countIssues(data, feature);

        return feature;
      })
      .sort(sortFeatures);

    // Render the top X axis

    var xScale = d3
      .scaleTime()
      .domain([globalStartDate, globalEndDate])
      .range([0, width - yAxisWidth * 2]);

    var xAxisTop = d3
      .axisTop()
      .scale(xScale)
      .ticks(Math.floor(width / 30), "%b %y");

    var xAxisTopGroup = chartG
      .append("g")
      .attr("class", "x-axis-top")
      .attr("transform", "translate(0, " + (xAxisTopHeight - 15) + ")")
      .call(xAxisTop)

    xAxisTopGroup
      .selectAll("text")
      .style("text-anchor", "start")
      .attr("fill", "#363636")
      .attr("dx", "0.8em")
      .attr("dy", "0.8em")
      .attr("transform", "rotate(-60)");

    // Render the bottom X axis

    var xAxisBottom = d3
      .axisBottom()
      .scale(xScale)
      .ticks(Math.floor(width / 30), "%b %y");

    var xAxisBottomGroup = chartG
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0, " + (chartHeight + xAxisTopHeight) + ")")
      .call(xAxisBottom);

    xAxisBottomGroup
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("fill", "#363636")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-60)");

    // Render the bars.

    var barHeight = chartHeight / featuresArray.length;

    var featureStartDate = function(feature) {
      if (feature.startDate === null) {
        return globalStartDate;
      }
      return new Date(feature.startDate);
    }

    var barWidthNotStarted = function(feature) {
      var end = xScale(new Date(feature.startDate || todayString));
      var start = xScale(globalStartDate);
      return end - start;
    };

    var barWidthInProgress = function(feature) {
      var end = xScale(new Date(feature.completedDate || todayString));
      var start = xScale(featureStartDate(feature));
      return end - start;
    };

    var barWidthOngoing = function(feature) {
      if (feature.status === 'Ongoing') {
        var end = xScale(new Date(feature.completedDate || todayString));
        var start = xScale(featureStartDate(feature));
        return end - start;
      }
      return 0;
    };

    var barWidthCompleted = function(feature) {
      if (feature.status === "Completed") {
        var end = xScale(new Date(todayString));
        var start = xScale(new Date(feature.completedDate || todayString));
        return end - start;
      }
      return 0;
    };

    var barX = 0;
    var barY = function(datum, index) {
      return index * barHeight;
    };

    var textX = 10;

    function textY(datum, index) {
      return barY(datum, index) + (barHeight / 2);
    }

    var rowsGroup = chartG
      .append("g")
      .attr("class", "rows-group")
      .attr("transform", "translate(0, " + xAxisTopHeight + ")");

    rowsGroup
      .selectAll("rect.not-started")
      .data(featuresArray)
      .enter()
      .append("rect")
      .attr("class", "bar not-started")
      .attr("x", barX)
      .attr("width", barWidthNotStarted)
      .attr("y", barY)
      .attr("height", barHeight);

    rowsGroup
      .selectAll("rect.in-progress")
      .data(featuresArray)
      .enter()
      .append("rect")
      .attr("class", "bar in-progress")
      .attr("x", function(d) {
        return xScale(featureStartDate(d));
      })
      .attr("width", barWidthInProgress)
      .attr("y", barY)
      .attr("height", barHeight);

    rowsGroup
      .selectAll('rect.completed')
      .data(featuresArray)
      .enter()
      .append('rect')
      .attr('class', "bar completed")
      .attr('x', function(d) {
        return xScale(new Date(d.completedDate || todayString));
      })
      .attr('width', barWidthCompleted)
      .attr('y', barY)
      .attr('height', barHeight);

    rowsGroup
      .selectAll("rect.ongoing")
      .data(featuresArray)
      .enter()
      .append("rect")
      .attr("class", "bar ongoing")
      .attr("x", function(d) {
        return xScale(featureStartDate(d));
      })
      .attr("width", barWidthOngoing)
      .attr("y", barY)
      .attr("height", barHeight);

    // Render opacity mask for washed-out colors on future dates

    chartG
      .append("rect")
      .attr("class", "future-mask")
      .attr("x", xScale(new Date(todayString)))
      .attr("y", 0)
      .attr("width", xScale(new Date(globalEndDate)) - xScale(new Date(todayString)))
      .attr("height", chartHeight)
      .attr("transform", "translate(0, " + xAxisTopHeight + ")");

    // Render today line.

    var todayLineColor = "orange";
    var xScaledToday = xScale(todayDate);
    var todayLineExtension = 65;

    chartG
      .append("line")
      .attr("x1", xScaledToday)
      .attr("x2", xScaledToday)
      .attr("y1", 0)
      .attr("y2", xAxisTopHeight + chartHeight + todayLineExtension)
      .attr("stroke-width", 2)
      .attr("stroke", todayLineColor)
      .style("pointer-events", "none");

    chartG
      .append("text")
      .attr("x", xScaledToday)
      .attr("y", xAxisTopHeight + chartHeight + todayLineExtension + 15)
      .attr("font-size", "16px")
      .attr("fill", "#363636")
      .attr("text-anchor", "middle")
      .text("Today");

    // Feature descriptions
    rowsGroup
      .selectAll("text.description")
      .data(featuresArray)
      .enter()
      .append("text")
      .attr("class", "description")
      .attr("x", textX)
      .attr("y", textY)
      .text(function (d) { return d.description; });

    // Tooltips.

    var tooltip = d3
      .select("#burn-down-chart")
      .append("div")
      .attr("class", "tooltip");

    tooltip.append("div").attr("class", "tooltipDescription");
    tooltip.append("div").attr("class", "tooltipRequirements");
    tooltip.append("div").attr("class", "tooltipIssues");
    // tooltip.append("div").attr("class", "tooltipPercentDone");

    function hideDarkBackground() {
      darkBackground.style("display", "none");
    }

    var darkBackground = d3
      .select("body")
      .append("div")
      .attr("class", "darkBackground")
      .on("click", hideDarkBackground);

    var overlay = darkBackground
      .append("div")
      .attr("class", "overlay")
      .on("click", function(e) {
        d3.event.stopPropagation();
      });

    function loadFeatureOverlay(d, i) {
      overlay.html("");

      overlay
        .append("div")
        .attr("class", "overlayCloseButton")
        .text("Close")
        .on("click", hideDarkBackground);

      overlay
        .append("h2")
        .attr("class", "overlayH2")
        .text("Feature: " + d.feature_id + " (" + formatStatus(d.status) + ")");

      overlay
        .append("div")
        .attr("class", "overlayFeatureDescription")
        .text(d.description);

      overlay
        .append("h3")
        .attr("class", "overlayH3")
        .text("Requirements");

      var reqs = d.requirements.map(function(reqId) {
        return data.requirements[reqId];
      });

      var table = makeFeatureTable(".overlay", reqs, data.issues);

      darkBackground.style("display", "block");
    }

    chartG
      .selectAll([
        "rect.completed",
        "rect.in-progress",
        "rect.not-started",
        "rect.ongoing"
      ])
      .on("mouseover", function(d) {
        tooltip.select(".tooltipDescription").html(d.description);
        tooltip.select(".tooltipRequirements").html(d.requirements.length + " Requirements");
        tooltip.select(".tooltipIssues").html(d.issueCount + " Issue Tickets");
        // tooltip.select(".tooltipPercentDone").html(d.percentDone + "% done");
        tooltip.style("display", "block");
      })
      .on("mouseout", function(d) {
        tooltip.style("display", "none");
      })
      .on("mousemove", function(d) {
        tooltip
          .style("top", d3.event.layerY + 10 + "px")
          .style("left", d3.event.layerX + 10 + "px");
      })
      .on("click", loadFeatureOverlay);
  };
})();