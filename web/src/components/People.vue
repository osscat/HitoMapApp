<template>
  <div>
    <b-field grouped>
      <b-autocomplete
        v-model="name"
        placeholder="氏名（スペースなし）"
        :data="filteredSuggestions">
      </b-autocomplete>
      <div class="control">
        <a class="button is-info" @click="search">
          探す
        </a>
      </div>
    </b-field>
    <div class="notification" v-if="message">
      {{ message }}
    </div>
    <div class="box" v-if="elements">
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
import { CY_CONFIG, LAYOUT_OPTIONS, makeElements } from '../common/peopleGraph'

export default {
  name: 'People',
  data: function () {
    return {
      name: "",
      people: [],
      message: null,
      cyConfig: {
        ...CY_CONFIG,
        layout: LAYOUT_OPTIONS
      },
      elements: null
    }
  },
  mounted: function () {
    this.getPeople().then(people => this.people = people)
  },
  computed: {
    filteredSuggestions() {
      return this.people.filter((option) => {
        return option
          .toString()
          .toLowerCase()
          .indexOf(this.name.toLowerCase()) >= 0
      })
    }
  },
  methods: {
    preConfig(cytoscape) {
      cytoscape.use(cola);
    },

    afterCreated(cy) {
      cy.on('click', this.onClick)
    },

    onClick(event) {
      if (event.target === event.cy) return
      if (event.target.isNode()) {
        this.name = event.target.data().label
      }
    },

    async getPeople() {
      const result = await this.$neo4j.getResult("MATCH (p:Person) RETURN p.name")
      const people = result.records.map(p => p.get("p.name"))
      people.sort()
      return people
    },

    async hasHobby(name) {
      const cypher = "MATCH (p)-[:LIKE]->(h) WHERE p.name = $name AND NOT h.name = 'なし' RETURN h"
      const result = await this.$neo4j.getResult(cypher, { name })
      return result.records.length > 0
    },

    async search() {
      this.message = null
      this.elements = null
      const hasHobby = await this.hasHobby(this.name)
      if (!hasHobby) {
        this.message = "趣味が... ないですね"
        return
      }

      // 検索
      const cypher = `MATCH p=(p1)-[:LIKE]->(h)<-[:LIKE]->()
        WHERE p1.name = $name RETURN p`
      const result = await this.$neo4j.getResult(cypher, { name: this.name })
      this.elements = makeElements(result, this.name)
      this.cyConfig.elements = this.elements
    }
  }
}
</script>

<style scoped>
</style>
