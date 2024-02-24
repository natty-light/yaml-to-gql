import { parse } from "yaml";
import { readFileSync } from "fs"

type Tree = {
    [field: string]: string | (string | object)[] | Tree
}

type InputNode = {
    [input: string]: string
}

const constructQuery = (tree: Tree, tabDepth: number): string => {
    let out = ''

    const tabPrefix = "  ".repeat(tabDepth)

    const keys = Object.keys(tree)
    keys.forEach((key) => {
        // if tree[key] is a string, just append it with a new line
        if (typeof tree[key] == 'string') {
            out += `${tabPrefix}${tree[key]}\n`
        
        // if tree[key] is an array, loop over each value and call parse
        } else if (Array.isArray(tree[key])) {
            // cast as for typescript
            const values = tree[key] as (string | object)[]
            out += `${tabPrefix}${key}(where: $where) { \n` // wrap next block with `key { }`

            values.forEach((value) => {
                    if (typeof value == 'string') {
                        out += `${tabPrefix}${value}\n`
                    } else {
                        out += constructQuery(value as Tree, tabDepth + 1)
                    }
                })
            out += `${tabPrefix}}\n`
        } else {
            // Here we know that tree[key] is an instance of HygraphTree
            out += `${tabPrefix}${key} { \n` // If the node is a HygraphTree, we want to create the `key { }` structure
            out += constructQuery(tree[key] as Tree, tabDepth + 1)
            out += `${tabPrefix}}\n`
        }
    })

    return out
}

// input yaml will always look like this structure
//
// inputs: 
//  - destination:
//    - destinationWhere: DestinationInputType
//  - cms: 
//    - destinationWhere: DestinationInputType
//    - residenceWhere: ResidenceInputType

const constructInputs = (nodes: Tree[]) => {
    const inputMap: {[key: string]: string} = {}

    nodes.forEach((node) => {
        const key = Object.keys(node)[0] // each node should have a single key?
        inputMap[key] = '('

        const inputs = node[key] as InputNode[] // Will always be an array

        inputs.forEach((input, idx) => {
            const inputName = Object.keys(input)[0] // input will look like {inputName: inputValue}
            const inputValue = input[inputName] as string

            inputMap[key] += `${inputName}: $${inputValue}`

            if (idx != inputs.length - 1) {
                inputMap[key] += ', '
            }

        })
        inputMap[key] += ')'
    })
    return inputMap
}


const main = () => {
    const src = Buffer.from(readFileSync('test.yaml')).toString()

    const parsed: Tree = parse(src) // This assertion will hold for the YAML we are parsing
    
    const cmsNode = { cms: parsed['cms']}
    const inputNode = { inputs : parsed['inputs']}

    const constructed = constructQuery(cmsNode, 1)
    const inputs = constructInputs(inputNode['inputs'] as Tree[])
    
    const query = `
    query Query {
    ${constructed}
    }`
    
    console.log(query)
}

main()