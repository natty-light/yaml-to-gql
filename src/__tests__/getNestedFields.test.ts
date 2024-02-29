import {getNestedField} from "../utils";

const obj = {
  "data": {
    "destination": {
      "destinationId": 22,
      "name": "Montage Laguna Beach",
      "locationGroup": {
        "name": "Laguna Beach, California"
      },
      "residences": [
        {
          "residenceId": 569,
          "name": "Montage Resort"
        }
      ]
    }
  }
}

describe('getNestedField: Deep object access', () => {
  it('given an object path a an array of strings, it accesses deep fields on an object', () => {
    const path = 'data.destination.destinationId'
    const val = getNestedField(obj, path.split('.'))
    expect(val).toBe(22)
  })

  it('given an object path a an array of strings, it accesses deep fields on an object', () => {
    const path = 'data.destination.residences.0.residenceId'
    const val = getNestedField(obj, path.split('.'))
    expect(val).toBe(569)
  })
})
