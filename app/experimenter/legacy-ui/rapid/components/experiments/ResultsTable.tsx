import React from "react";

import { featureOptions } from "experimenter-rapid/components/forms/ExperimentFormOptions";
import { AnalysisPoint, ExperimentData } from "experimenter-types/experiment";

const getFeatureNameMappings = () => {
  // Create feature-name mappings.
  const featureNameMappings = {};
  featureOptions.forEach((featureRow) => {
    featureNameMappings[featureRow["value"]] = featureRow["name"];
  });
  return featureNameMappings;
};

const getResultMetrics = (featureData) => {
  // A mapping of metric label to relevant statistic.
  const resultsMetricsMap = {
    retained: "binomial",
    search_count: "mean",
    identity: "count",
  };
  const resultsMetricsList = [
    { value: "retained", name: "2-Week Browser Retention" },
    { value: "search_count", name: "Daily Mean Searches Per User" },
    { value: "identity", name: "Total Users" },
  ];
  const featureNameMappings = getFeatureNameMappings();

  featureData.forEach((feature) => {
    const featureMetricID = `${feature}_ever_used`;
    resultsMetricsMap[featureMetricID] = "binomial";
    resultsMetricsList.unshift({
      value: featureMetricID,
      name: `${featureNameMappings[feature]} Conversion`,
    });
  });
  return { resultsMetricsList, resultsMetricsMap };
};

const getResultsData = (data, resultMetrics) => {
  const analysisData = data.analysis;

  // TODO: Remove these 3 lines if you're querying "overall" data.
  const window = "weekly";
  const filteredData = analysisData[window].filter((row) => {
    return row["window_index"] === "2";
  });

  const results = {};
  Object.values(filteredData).forEach((row: AnalysisPoint) => {
    const { metric, branch, statistic, point, lower, upper, comparison } = row;

    if (!(branch in results)) {
      results[branch] = {};
    }

    if (
      !comparison &&
      metric in resultMetrics &&
      resultMetrics[metric] === statistic
    ) {
      results[branch][metric] = { lower, upper, point };
    }
  });
  return results;
};

const ResultsTable: React.FC<{ experimentData: ExperimentData }> = ({
  experimentData,
}) => {
  const { resultsMetricsList, resultsMetricsMap } = getResultMetrics(
    experimentData.features,
  );
  const resultsData = getResultsData(experimentData, resultsMetricsMap);

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col"></th>
          {resultsMetricsList.map((value, index) => {
            return (
              <th key={index} scope="col">
                {value.name}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {Object.keys(resultsData).map((branch, index) => {
          return (
            <tr key={index}>
              <th scope="row">{branch}</th>
              {resultsMetricsList.map((metric, index) => {
                const metricKey = metric["value"];
                const { lower, upper, point } = resultsData[branch][metricKey];
                let value = `[${lower}, ${upper}]`;
                if (metricKey === "identity") {
                  value = point;
                }

                return <td key={index}>{value}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ResultsTable;
