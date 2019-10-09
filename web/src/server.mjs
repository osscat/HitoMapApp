import _ from 'lodash'
import express from 'express'
import cytosnap from 'cytosnap'
import neo4jdriver from 'neo4j-driver'
import { CY_CONFIG, LAYOUT_OPTIONS, makeElements } from './common/peopleGraph.mjs'
import { SERVER_USER, SERVER_PASS, SERVER_URI } from './common/constants.mjs'

const neo4j = neo4jdriver.v1
const app = express()

cytosnap.use(['cytoscape-cola'])
const snap = cytosnap({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
})

async function snapshot(elements) {
  await snap.start()
  return snap.shot({
    elements,
    layout: LAYOUT_OPTIONS,
    ...CY_CONFIG,
    resolvesTo: 'base64uri',
    format: 'png',
    width: 640,
    height: 480,
    background: 'transparent'
  })
}

async function getResult(cypher, parameters) {
  const driver = neo4j.driver(SERVER_URI, neo4j.auth.basic(SERVER_USER, SERVER_PASS))
  const session = driver.session()
  try {
    return await session.writeTransaction(tx => tx.run(cypher, parameters))
  }
  finally {
    session.close()
  }
}

async function getSimilarName(fullname) {
  const cypher = `MATCH (p:Person) WHERE p.name =~ '.*[${fullname}].*' RETURN p.name`
  const result = await getResult(cypher)
  const targetChars = fullname.split('')
  const getSimilarity = (name) => {
    const chars = name.split('')
    return _.intersection(chars, targetChars).length
  }
  return _(result.records)
    .map(r => r.get(0))
    .sortBy(getSimilarity)
    .last()
}

app.get('/people-around/:fullname', (req, res, next) => {
  (async () => {
    const cypher = 'MATCH p=(p1)-[:LIKE]->(h)<-[:LIKE]->() WHERE p1.name = $name RETURN p'
    let fullname = req.params['fullname']
    let result = await getResult(cypher, { name: fullname })

    // 結果が0件の場合、パラメータで指定されていれば似た名前で探す
    if (!result.records.length && req.query.similar === 'true') {
      fullname = await getSimilarName(fullname)
      if (fullname) {
        result = await getResult(cypher, { name: fullname })
      }
    }

    if (!result.records.length) {
      res.send('残念ながら見つかりませんでした...')
      return
    }
    
    const elements = makeElements(result, fullname)
    const data = await snapshot(elements)
    const base64Data = data.replace(/^data:image\/png;base64,/, '')
    const img = Buffer.from(base64Data, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img); 
  })().catch(next)
})

app.listen(3000, () => console.log('The app listening on port 3000!'))
