import {Tree, TriggerPropertiesLookup} from "./types";
import {readFileSync} from "fs";
import {parse} from "yaml";
import {constructInputs, parseTree} from "./utils";

type ParseYamlReturn = {
  query: string;
  triggerPropertiesLookup: TriggerPropertiesLookup;
  campaignId: string;
}

export const parseYaml = (destinationId: number, residenceId: number): ParseYamlReturn  => {
  const src = Buffer.from(readFileSync('test.yaml')).toString()

  const parsed: Tree = parse(src) // This assertion will hold for the YAML we are parsing

  const cmsNode = { cms: parsed['cms']}
  const inputNode = { inputs : parsed['inputs']}
  const triggerPropertiesLookup = parsed['triggerProperties'] as TriggerPropertiesLookup
  const campaignId = parsed['campaignId'] as string;
  const inputs = constructInputs(inputNode['inputs'] as Tree[])
  const constructed = parseTree(cmsNode, inputs, 1)

  return {
    query: `query Query {\n${constructed}\n}`,
    triggerPropertiesLookup,
    campaignId,
  }
}
