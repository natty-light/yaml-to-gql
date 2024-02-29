import { parse } from "yaml";
import { readFileSync } from "fs"
import type { InputMap, InputNode, Leaf, Tree } from "./types";
import * as timers from "timers";
import {config} from "dotenv";
import resolveEnvironment from "./environment";
import {TriggerPropertiesLookup} from "./types";
import {initBraze, triggerCampaignSend} from "./braze/braze";
import {initHygraph} from "./hygraph/hygraph";
import {AxiosRequestConfig} from "axios/index";
import {BrazeTriggerProperties} from "./braze/types";
import {parseYaml} from "./yaml";
import {getNestedField} from "./utils";


export const getVariables = (): any => {
    return {
        destinationWhere: {
            where: {
                destinationId: 22
            }
        },
        residenceWhere: {
            where: {
                residenceId: 569
            }
        }
    }
}

const main = async () => {
    config();
    const env = resolveEnvironment();
    if (!env) {
        return
    }

    const braze = initBraze(env)
    const hygraph = initHygraph(env);

    const {query, triggerPropertiesLookup, campaignId } = parseYaml(22, 1);

    console.log(query)
    const variables = getVariables();

    const hygraphRequest: AxiosRequestConfig = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            query,
            variables,
        }),
    }

    const apiResponse = await hygraph.request(hygraphRequest)

    const apiTriggerProperties: BrazeTriggerProperties = {};
    for (const trigger of triggerPropertiesLookup) {
        const key = Object.keys(trigger)[0]
        apiTriggerProperties[key] = getNestedField(apiResponse.data, key.split('.'))
    }

    const campaignSendResponse = await triggerCampaignSend(
      env,
      braze,
      campaignId,
      [{ external_user_id: '' }],
      apiTriggerProperties,
    )

    console.log(campaignSendResponse)
}

(async () => {
    await main();
})()
