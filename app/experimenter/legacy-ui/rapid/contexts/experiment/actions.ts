import {
  ExperimentReducerActionType,
  ExperimentData,
  ExperimentAnalysis,
} from "experimenter-types/experiment";
import { ExperimentReducerAction } from "experimenter-types/experiment";

export const fetchExperiment = (experimentSlug: string) => async (
  experimentData: ExperimentData,
  dispatch: React.Dispatch<ExperimentReducerAction>,
): Promise<void> => {
  const data_response = await fetch(`/api/v3/experiments/${experimentSlug}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const analysis_response = await fetch(
    `/api/v3/visualization/${experimentSlug}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data: ExperimentData = await data_response.json();
  const analysis: ExperimentAnalysis = await analysis_response.json();

  data.analysis = analysis;

  dispatch({
    type: ExperimentReducerActionType.UPDATE_STATE,
    state: data,
  });
};

export const saveExperiment = async (
  experimentSlug: string,
  formData: ExperimentData,
): Promise<Response> => {
  const url = experimentSlug
    ? `/api/v3/experiments/${experimentSlug}/`
    : "/api/v3/experiments/";
  return await fetch(url, {
    method: experimentSlug ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
};

export const updateExperiment = (value: Partial<ExperimentData>) => (
  experimentData: ExperimentData,
  dispatch: React.Dispatch<ExperimentReducerAction>,
): void => {
  dispatch({
    type: ExperimentReducerActionType.UPDATE_STATE,
    state: {
      ...experimentData,
      ...value,
    },
  });
};

export const requestReview = () => async (
  experimentData: ExperimentData,
  dispatch: React.Dispatch<ExperimentReducerAction>,
): Promise<void> => {
  await fetch(`/api/v3/experiments/${experimentData.slug}/request_review/`, {
    method: "POST",
  });
  if (experimentData.slug) {
    fetchExperiment(experimentData.slug)(experimentData, dispatch);
  }
};
