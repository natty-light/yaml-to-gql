import {config} from "dotenv";
import resolveEnvironment from "./environment";
import {initBraze, triggerCampaignSend} from "./braze/braze";
import {initHygraph} from "./hygraph/hygraph";
import {AxiosRequestConfig} from "axios";
import {BrazeTriggerProperties} from "./braze/types";
import {parseYaml} from "./yaml";
import {getNestedField} from "./utils";


export const getVariables = (): any => {
    return {
        "destinationWhere": {
            "destinationId": 22
        },
        "residenceWhere": {
            "residenceId": 569
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

    try {
        const { data: hygraphData } = await hygraph.request<{ data: any }>(hygraphRequest)
        console.log(hygraphData)
        const apiTriggerProperties: BrazeTriggerProperties = {};
        for (const trigger of triggerPropertiesLookup) {
            const key = Object.keys(trigger)[0]
            const path = trigger[key];
            apiTriggerProperties[key] = getNestedField(hygraphData, path.split('.'))
        }
        const campaignSendResponse = await triggerCampaignSend(
          env,
          braze,
          campaignId,
          [{ external_user_id: '' }],
          apiTriggerProperties,
        )
        console.log(campaignSendResponse)
    } catch (e) {
        console.error(e)
    }
}

(async () => {
    await main();
})()
