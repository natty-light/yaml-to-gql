export type Tree = {
  [field: string]: Leaf
}

export type Leaf = string | (string | Tree)[] | Tree


export type InputNode = {
  [input: string]: string
}

export type InputMap = {
  [input: string]: string
}
