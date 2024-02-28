import {getNestedField} from "../main";

const obj = {
  cms: {
    destination: {
      destinationId: 1,
      name: 'destinationName',
      locationGroup: {
        name: 'locationGroupName'
      },
      residences: [
        {
          residenceId: 2,
          name: 'residenceName'
        }
      ]
    }
  }
}

describe('getNestedField: Deep object access', () => {
  it('given an object path a an array of strings, it accesses deep fields on an object', () => {
    const path = 'cms.destination.destinationId'
    const val = getNestedField(obj, path.split('.'))
    expect(val).toBe(1)
  })

  it('given an object path a an array of strings, it accesses deep fields on an object', () => {
    const path = 'cms.destination.residences.0.residenceId'
    const val = getNestedField(obj, path.split('.'))
    expect(val).toBe(2)
  })
})
