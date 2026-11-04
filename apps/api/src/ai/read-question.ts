import {
  askCurrencyOf,
  askModelOutputSchema,
  intentOf,
  likeForLike,
  queryInMinor,
  readQuestionPrompt,
  readQuestionSystemFor,
  type AskRequest,
  type AskResponse,
} from '@6pm/domain';

import { ApiError } from '../errors';
import { generate, type AnthropicConfig, type Generated } from './anthropic';

/**
 * The phone gives the server 10 s in all; the call, a second attempt included, gets 8 s of it, so
 * the answer still has time to travel back.
 */
export const askReadTimeoutMs = 8_000;
/** A short structured answer plus the model's own thinking, which counts against this too. */
export const askReadMaxTokens = 1_024;

/**
 * Reads one question into a query, and the intent an older phone reads from it. The question and
 * the names the phone sent are all the model sees. The model reads amounts in the home currency's
 * major units, as people say them; the answer carries the phone's minor units.
 */
export async function readQuestion(
  config: AnthropicConfig,
  request: AskRequest,
): Promise<Generated<AskResponse>> {
  const currency = askCurrencyOf(request);
  const generated = await generate(config, {
    system: readQuestionSystemFor(currency),
    prompt: readQuestionPrompt(request),
    schema: askModelOutputSchema(currency),
    maxTokens: askReadMaxTokens,
    timeoutMs: askReadTimeoutMs,
    totalMs: askReadTimeoutMs,
  });
  const read = queryInMinor(generated.output.query, currency);
  // An amount that rounds to nothing in minor units is not a reading.
  if (read === null) {
    throw new ApiError('model_unavailable', 'The model is not answering', {
      reason: 'invalid_output',
    });
  }
  const query = likeForLike(read);
  return { ...generated, output: { intent: intentOf(query), query } };
}
