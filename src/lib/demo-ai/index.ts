import { buildCampaignOutputs } from "@/lib/demo-ai/builders";
import { buildCampaignContext, pickDealerPlacement } from "@/lib/demo-ai/context";
import { applyMemoryToContext } from "@/lib/demo-ai/memory-influence";
import type {
  DemoCampaignInput,
  DemoCampaignOutput,
  GenerationRuntime,
} from "@/lib/demo-ai/types";
import { SeededRandom } from "@/lib/demo-ai/types";
import type { DealershipMemoryProfile } from "@/types/memory";

export type {
  DemoCampaignInput,
  DemoCampaignOutput,
  DemoCampaignPlatform,
  DemoCampaignTone,
  DemoCampaignType,
} from "@/lib/demo-ai/types";

function createGenerationRuntime(
  input: DemoCampaignInput,
  memory?: DealershipMemoryProfile,
): GenerationRuntime {
  const seed = Date.now() + Math.random();
  const rng = new SeededRandom(seed);
  const baseContext = buildCampaignContext(input, rng);
  const context = applyMemoryToContext(baseContext, memory);

  return {
    rng,
    context,
    input,
    dealerPlacement: pickDealerPlacement(rng),
    useRhetoricalQuestion: rng.chance(0.2),
    memory,
  };
}

export function generateCampaign(
  inputs: DemoCampaignInput,
  memory?: DealershipMemoryProfile,
): DemoCampaignOutput {
  const runtime = createGenerationRuntime(inputs, memory);
  return buildCampaignOutputs(runtime);
}

export { SeededRandom } from "@/lib/demo-ai/types";
