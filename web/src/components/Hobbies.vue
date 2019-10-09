<template>
  <div>
    <div class="people box is-pulled-right">
      <div v-if="hobbyName">
        <h3 class="subtitle">"{{hobbyName}}" を趣味に持つ人</h3>
        <ul>
          <li v-for="person in people" :key="person.id">
            {{person.name}}
          </li>
        </ul>
      </div>
      <p class="has-text-grey" v-if="!hobbyName">
        興味がある趣味をクリックしてみましょう
      </p>
    </div>
    <div class="hobbies box" v-if="elements">
      <cytoscape 
        :config="cyConfig"
        :preConfig="preConfig"
        :afterCreated="afterCreated"
        style="width: 100%; height: 600px"
      >
      </cytoscape>
    </div>
  </div>
</template>

<script>
import cola from "cytoscape-cola"

const cyConfig = {
  style: [ // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-opacity': 0.5,
        'label': 'data(label)',
        'font-size': 'data(fontSizePx)',
        'text-halign': 'center',
        'text-valign': 'center',
        'width': 'data(sizePx)',
        'height': 'data(sizePx)'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 0
      }
    // },
    // {
    //   selector: 'edge[relavance > 5]',
    //   style: {
    //     'width': 'data(relavance)'
    //   }
    }
  ],
  layout: {
    name: 'cola'
    // edgeLength: (edge) => 400 / edge.data('relavance')
  },
  wheelSensitivity: 0.1
}

export default {
  name: 'Hobbies',
  data: function () {
    return {
      cyConfig,
      elements: null,
      hobbyName: null,
      people: []
    }
  },
  mounted: function () {
    this.showHobbies()
  },
  methods: {
    preConfig(cytoscape) {
      cytoscape.use(cola)
    },

    afterCreated(cy) {
      cy.on('click', this.onClick)
    },

    onClick(event) {
      if (event.target === event.cy) return
      if (event.target.isNode()) {
        this.showPeople(event.target.data().label)
      }
    },

    async showHobbies() {
      this.elements = await this.getHobbies()
      this.cyConfig.elements = this.elements
    },

    async getHobbies() {
      const minPeople = 2
      const minRelavance = 2

      let cypher = `
        MATCH (h)<-[:LIKE]-(p) WHERE h.name <> 'なし'
        WITH h, count(p) as size WHERE size >= ${minPeople}
        RETURN h, size ORDER BY size DESC`
      let result = await this.$neo4j.getResult(cypher)
      const hobbies = result.records.map(record => {
        const h = record.get("h")
        const size = record.get("size")*1
        return {
          data: {
            id: h.identity.toString(),
            label: h.properties.name,
            sizePx: 10 + size*2 + 'px',
            fontSizePx: 5 + size*0.5 + 'px'
          }
        }
      })
      
      cypher = `
        MATCH (h)<-[:LIKE]-(p) WHERE h.name <> 'なし'
        WITH h, count(p) as size WHERE size >= ${minPeople}
        WITH collect(h.name) as hobbies
        MATCH (h1)<-[:LIKE]-(p)-[:LIKE]->(h2) 
        WHERE h1.name IN hobbies AND h2.name IN hobbies
        WITH h1, h2, count(p) as relavance WHERE relavance >= ${minRelavance}
        RETURN h1, h2, relavance ORDER BY relavance DESC`
      result = await this.$neo4j.getResult(cypher)
      const relavances = result.records.map(record => {
        const source = record.get("h1").identity.toString()
        const target = record.get("h2").identity.toString()
        return {
          data: {
            source,
            target,
            id: source + '-' + target,
            relavance: record.get("relavance")
          }
        }
      })

      return hobbies.concat(relavances)
    },

    async showPeople(hobby) {
      const cypher = 'MATCH (p)-[:LIKE]->(h:Hobby) WHERE h.name = $name RETURN p ORDER BY p.name'
      const result = await this.$neo4j.getResult(cypher, { name: hobby })
      this.people = result.records.map(record => {
        const p = record.get("p")
        return {
          id: p.identity.low,
          name: p.properties.name
        }
      })
      this.hobbyName = hobby
    }
  }
}
</script>

<style scoped>
.hobbies {
  margin-right: 300px;
}
.people {
  width: 250px;
  position: sticky;
  top: 10px;
}
</style>
