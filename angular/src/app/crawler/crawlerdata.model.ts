export interface CrawlerData {
  nodes: Node[],
  edges: Edge[]
}

export interface Node {
  url: string,
  domainName: string,
  title: string,
  favicon: string
}

export interface Edge {
  source: number,
  target: number
}
