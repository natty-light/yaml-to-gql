import { parse } from "yaml";
import { readFileSync } from "fs"

type Tree = {
    [field: string]: Leaf
}

type Leaf = string | (string | Tree)[] | Tree


type InputNode = {
    [input: string]: string
}

type InputMap = {
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
    const inputMap: InputMap = {}

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

const parseLeaf =(leaf: Leaf, inputs: InputMap, tabDepth: number): string => {
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

const parseTree = (tree: Tree, inputs: InputMap, tabDepth: number): string => {
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

const getTreePaths = (tree: Tree): string[] => {
    const keys = Object.keys(tree);
    return keys.flatMap((key) => {
        const leaf = tree[key];
        return getLeafPaths(leaf).map((path) => `${key}.${path}`)
    })
}

const getLeafPaths = (leaf: Leaf): string[] => {
    if (typeof leaf == 'string') {
        return [leaf]
    } else if (Array.isArray(leaf)) {
        return leaf.flatMap((val) => typeof val == 'string' ? [val] : getTreePaths(val))
    } else {
        return getTreePaths(leaf)
    }
}



const main = () => {
    const src = Buffer.from(readFileSync('test.yaml')).toString()

    const parsed: Tree = parse(src) // This assertion will hold for the YAML we are parsing
    
    const cmsNode = { cms: parsed['cms']}
    const inputNode = { inputs : parsed['inputs']}
    const inputs = constructInputs(inputNode['inputs'] as Tree[])

    const constructed = parseTree(cmsNode, inputs, 1)
    
    const query = `query Query {\n${constructed}\n}`
    console.log(query)

    const paths = getTreePaths(cmsNode)
    console.dir(paths)
}

main()
