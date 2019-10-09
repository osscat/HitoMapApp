import { v1 as neo4j } from 'neo4j-driver'
import { SERVER_USER, SERVER_PASS, SERVER_URI } from '../common/constants'

const neo4jHelper = {
  install: function (Vue) {
    Vue.prototype.$neo4j = new Vue({
      data: {
        driver: neo4j.driver(SERVER_URI, neo4j.auth.basic(SERVER_USER, SERVER_PASS))
      },
      beforeDestroy: function () {
        this.driver.close()
      },
      methods: {
        async getResult(cypher, parameters) {
          const session = this.driver.session()
          try {
            return await session.writeTransaction(tx => tx.run(cypher, parameters))
          }
          finally {
            session.close()
          }
        }
      }
    })
  }
}
export default neo4jHelper