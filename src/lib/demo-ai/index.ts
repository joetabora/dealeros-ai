import { buildCampaignOutputs } from "@/lib/demo-ai/builders";
import { buildCampaignContext, pickDealerPlacement } from "@/lib/demo-ai/context";
import type {
  DemoCampaignInput,
  DemoCampaignOutput,
  GenerationRuntime,
} from "@/lib/demo-ai/types";
import { SeededRandom } from "@/lib/demo-ai/types";

export type {
  DemoCampaignInput,
  DemoCampaignOutput,
  DemoCampaignPlatform,
  DemoCampaignTone,
  DemoCampaignType,
} from "@/lib/demo-ai/types";

function createGenerationRuntime(input: DemoCampaignInput): GenerationRuntime {
  const seed = Date.now() + Math.random();
  const rng = new SeededRandom(seed);
  const context = buildCampaignContext(input, rng);

  return {
    rng,
    context,
    input,
    dealerPlacement: pickDealerPlacement(rng),
    useRhetoricalQuestion: rng.chance(0.2),
  };
}

export function generateCampaign(inputs: DemoCampaignInput): DemoCampaignOutput {
  const runtime = createGenerationRuntime(inputs);
  return buildCampaignOutputs(runtime);
}

export { SeededRandom } from "@/lib/demo-ai/types";
