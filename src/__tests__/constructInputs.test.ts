import type {Tree} from "../types";
import {constructInputs} from "../utils";

const inputNode: Tree = {
  "inputs": [
    {
      "destination": [
        {
          "where": "$destinationWhere"
        }
      ]
    },
    {
      "cms": [
        {
          "$destinationWhere": "DestinationInputType!"
        },
        {
          "$residenceWhere": "ResidenceInputType!"
        }
      ]
    },
    {
      "residence": [
        {
          "where": "$residenceWhere"
        }
      ]
    }
  ]
}

describe('constructInputs', () => {
  it('given a parsed yaml object, parse object into map of inputs to be used in parseTree()', () => {
    const inputs = constructInputs(inputNode['inputs'] as Tree[])
    expect(inputs['destination']).toBe('(where: $destinationWhere)')
    expect(inputs['residence']).toBe('(where: $residenceWhere)')
    expect(inputs['cms']).toBe('($destinationWhere: DestinationInputType!, $residenceWhere: ResidenceInputType!)')
  })
})
