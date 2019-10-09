import _ from 'lodash'

export const CY_CONFIG = {
  style: [
    {
      selector: 'node[?center]',
      style: {
        'background-color': '#666',
        'label': 'data(label)',
        'width': '50px',
        'height': '50px',
        'shape': 'star'
      }
    }, {
      selector: 'node[type = "Person"][!center]',
      style: {
        'label': 'data(label)',
        'width': 'data(sizePx)',
        'height': 'data(sizePx)'
      }
    }, {
      selector: 'node[type = "Hobby"]',
      style: {
        'background-color': 'orange',
        'label': 'data(label)',
        'width': '50px',
        'height': '50px'
      }
    }, {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
      }
    }
  ]
}

export const LAYOUT_OPTIONS = {
  name: "cola",
  nodeSpacing: function () { return 20 }
}

export function makeElements(result, fullname) {
  const segments = _.flatMap(result.records, r => r.get(0).segments)
      
  // ノード
  let nodes = _.flatMap(segments, s => [s.start, s.end])
  nodes = nodes.map(n => {
    const name = n.properties.name
    return {
      id: n.identity.toString(),
      label: name,
      type: n.labels.reduce((p, c) => p + c),
      center: name === fullname
    }
  })

  // エッジ
  const relationships = segments.map(s => s.relationship)
  const edges = relationships.map(r => {
    return {
      source: r.start.toString(),
      target: r.end.toString(),
      id: 'edge-' + r.identity.toString()
    }
  })

  // データ更新
  const nodesAndEdges = nodes.concat(edges)
  const grouped = _.groupBy(nodesAndEdges, 'id')
  const maxSize = 100
  const elements = _.map(grouped, value => {
    const e = value[0]
    e.size = Math.min(20 + value.length*10, maxSize)
    e.sizePx = e.size + 'px'
    return { data: e }
  })

  // 自分が中心に来やすくなるように
  // 自分 -> 趣味 -> 他人(関連大きい順) -> エッジ
  // の順番に並び替える
  const sortOrder = (node) => {
    const data = node.data
    if (data.label === fullname) return maxSize + 2
    if (data.type === 'Hobby') return maxSize + 1
    if (data.type === 'Person') return data.size
    return 0
  }
  elements.sort((a, b) => sortOrder(b) - sortOrder(a))

  return elements
}