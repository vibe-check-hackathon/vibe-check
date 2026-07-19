import { createFileRoute, redirect } from "@tanstack/react-router";
import { PIPELINE_STAGES } from "@/components/PipelineStages";

/**
 * The pipeline has no landing page of its own — it *is* the stage flow.
 * Entering it drops you on the first stage (Company snapshot).
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: PIPELINE_STAGES[0].to as never });
  },
});
