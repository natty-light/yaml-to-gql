import {Tree} from "../types";
import {constructInputs, parseTree} from "../utils";

const cmsNode: Tree = {
  "cms": {
    "destination": [
      "destinationId",
      "name",
      {
        "locationGroup": [
          "name"
        ]
      },
      {
        "residence": [
          "residenceId",
          "name"
        ]
      }
    ]
  }
}

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


describe('parseTree', () => {
  it('', () => {
    const inputs = constructInputs(inputNode['inputs'] as Tree[])
    const constructed = parseTree(cmsNode, inputs, 1)
    const query = `query Query {\n${constructed}\n}`
  })
})
