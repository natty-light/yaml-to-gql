import {Tree} from "../types";
import {getTreePaths} from "../main";

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

describe('getTreePath', () => {
  it('', () => {
    const result = getTreePaths(cmsNode)
    expect(result).toEqual([
      'cms.destination.destinationId',
      'cms.destination.name',
      'cms.destination.locationGroup.name',
      'cms.destination.residences.residenceId',
      'cms.destination.residences.name'
    ])
  })
})
