import { parse } from "yaml";
import { readFileSync } from "fs"
import type { InputMap, InputNode, Leaf, Tree } from "./types";
import * as timers from "timers";
import {config} from "dotenv";
import resolveEnvironment from "./environment";
import {TriggerPropertiesLookup} from "./types";
import {initBraze} from "./braze/braze";
import {initHygraph} from "./hygraph/hygraph";
import {AxiosRequestConfig} from "axios/index";
import {BrazeTriggerProperties} from "./braze/types";

// input yaml will always look like this structure
//
// inputs:
//  - destination:
//    - destinationWhere: DestinationInputType
//  - cms:
//    - destinationWhere: DestinationInputType
//    - residenceWhere: ResidenceInputType

export const constructInputs = (nodes: Tree[]) => {
    const inputMap: InputMap = {}

    nodes.forEach((node) => {
        const key = Object.keys(node)[0] // each node should have a single key for our purposes
        inputMap[key] = '('

        const inputs = node[key] as InputNode[] // Will always be an array

        inputs.forEach((input, idx) => {
            const inputName = Object.keys(input)[0] // input will look like {inputName: inputValue}
            const inputValue = input[inputName] as string

            inputMap[key] += `${inputName}: ${inputValue}`

            if (idx != inputs.length - 1) {
                inputMap[key] += ', '
            }

        })
        inputMap[key] += ')'
    })
    return inputMap
}

export const parseLeaf =(leaf: Leaf, inputs: InputMap, tabDepth: number): string => {
    const prefix = "  ".repeat(tabDepth)
    if (typeof leaf == 'string') {
        return `${prefix}${leaf}\n`
    } else if (Array.isArray(leaf)) {
        let out = ''
        leaf.forEach((leaf) => {
            out += typeof leaf == 'string' ? parseLeaf(leaf, inputs, tabDepth + 1) : parseTree(leaf, inputs, tabDepth + 1)
        })
        return out
    } else {
        return parseTree(leaf, inputs, tabDepth + 1)
    }
}

export const parseTree = (tree: Tree, inputs: InputMap, tabDepth: number): string => {
    let out = ''
    const prefix = "  ".repeat(tabDepth)
    const keys = Object.keys(tree)

    keys.forEach((key) => {
        const leaf = tree[key]
        const args = inputs[key] ?? ''

        out += `${prefix}${key}${args} { \n` // If the node is a HygraphTree, we want to create the `key { }` structure
        out += parseLeaf(leaf, inputs, tabDepth + 1)
        out += `${prefix}}\n`
    })

    return out
}

export const getTreePaths = (tree: Tree): string[] => {
    const keys = Object.keys(tree);
    return keys.flatMap((key) => {
        const leaf = tree[key];
        return getLeafPaths(leaf).map((path) => `${key}.${path}`)
    })
}

export const getLeafPaths = (leaf: Leaf): string[] => {
    if (typeof leaf == 'string') {
        return [leaf]
    } else if (Array.isArray(leaf)) {
        return leaf.flatMap((val) => typeof val == 'string' ? [val] : getTreePaths(val))
    } else {
        return getTreePaths(leaf)
    }
}

// for array access, you need to pass in something like: cms.destination.residences.0.residenceId
export const getNestedField =(obj: unknown, fields: string[]): any  => {
    // If obj is not an object or fields is empty, return undefined
    if (typeof obj !== 'object' || !fields.length) {
        return undefined;
    }
    let nestedValue: any = obj;
    // Iterate through fields array to access nested properties
    for (const field of fields) {
        // If nestedValue is not an object or field doesn't exist, return undefined
        if (typeof nestedValue !== 'object' || !(field in nestedValue)) {
            return undefined;
        }
        // Access the nested property
        nestedValue = nestedValue[field];
    }
    return nestedValue;
}

const parseYaml = (destinationId: number, residenceId: number): { query: string, triggerPropertiesLookup: TriggerPropertiesLookup  } => {
    const src = Buffer.from(readFileSync('test.yaml')).toString()

    const parsed: Tree = parse(src) // This assertion will hold for the YAML we are parsing

    const cmsNode = { cms: parsed['cms']}
    const inputNode = { inputs : parsed['inputs']}
    const triggerPropertiesLookup = parsed['triggerProperties'] as TriggerPropertiesLookup

    const inputs = constructInputs(inputNode['inputs'] as Tree[])
    const constructed = parseTree(cmsNode, inputs, 1)

    return {
        query: `query Query {\n${constructed}\n}`,
        triggerPropertiesLookup,
    }
}

const getVariables = (): any => {
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

    const {query, triggerPropertiesLookup } = parseYaml(22, 1);
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

    const brazeRequest: AxiosRequestConfig = {

    }
}

(async () => {
    await main();
})()
