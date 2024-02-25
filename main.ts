import { parse } from "yaml";
import { readFileSync } from "fs"

type Tree = {
    [field: string]: Leaf
}

type Leaf = string | (string | Tree)[] | Tree


type InputNode = {
    [input: string]: string
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
        const key = Object.keys(node)[0] // each node should have a single key for our purposes
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

const parseNode =(node: Leaf, tabDepth: number): string => {
    const prefix = "  ".repeat(tabDepth)
    if (typeof node == 'string') {
        return `${prefix}${node}\n`
    } else if (Array.isArray(node)) {
        let out = ''
        node.forEach((leaf) => {
            out += typeof leaf == 'string' ? parseNode(leaf, tabDepth + 1) : parseTree(leaf, tabDepth + 1)
        })
        return out
    } else {
        return parseTree(node, tabDepth + 1)
    }
}

const parseTree = (tree: Tree, tabDepth: number): string => {
    let out = ''
    const prefix = "  ".repeat(tabDepth)
    const keys = Object.keys(tree)
    
    keys.forEach((key) => {
        const leaf = tree[key]
        out += `${prefix}${key} { \n` // If the node is a HygraphTree, we want to create the `key { }` structure
        out += parseNode(leaf, tabDepth + 1)
        out += `${prefix}}\n`
    })

    return out
}


const main = () => {
    const src = Buffer.from(readFileSync('test.yaml')).toString()

    const parsed: Tree = parse(src) // This assertion will hold for the YAML we are parsing
    
    const cmsNode = { cms: parsed['cms']}
    const inputNode = { inputs : parsed['inputs']}

    const constructed = parseTree(cmsNode, 1)
    const inputs = constructInputs(inputNode['inputs'] as Tree[])
    
    const query = `query Query {\n${constructed}\n}`
    
    console.log(query)
}

main()
