import { json } from "@remix-run/node";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  countCuratedInferences,
  countFeedbacksForMetric,
  countInferencesForFunction,
} from "~/utils/clickhouse";
import { getConfig } from "~/utils/config.server";

/// Count the number of inferences, feedbacks, and curated inferences for a given function and metric
/// This is used to determine the number of inferences to display in the UI
/// Call this route with optional function and metric parameters to get the counts
/// If only a function is provided, it will count all inferences for that function
/// If only a metric is provided, it will count all feedbacks for that metric
/// If both a function and metric are provided, it will count all curated inferences for that function and metric
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const functionName = url.searchParams.get("function");
  const metricName = url.searchParams.get("metric");

  let inferenceCount = null;
  let feedbackCount = null;
  let curatedInferenceCount = null;
  const config = await getConfig();
  if (functionName) {
    inferenceCount = await countInferencesForFunction(
      functionName,
      config.functions[functionName],
    );
  }
  if (metricName) {
    feedbackCount = await countFeedbacksForMetric(
      metricName,
      config.metrics[metricName],
    );
  }
  if (functionName && metricName) {
    curatedInferenceCount = await countCuratedInferences(
      functionName,
      config.functions[functionName],
      metricName,
      config.metrics[metricName],
    );
  }
  return json({ inferenceCount, feedbackCount, curatedInferenceCount });
}