import Vue from 'vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import VueCytoscape from 'vue-cytoscape'
import 'vue-cytoscape/dist/vue-cytoscape.css'
import Neo4jHelper from './plugins/Neo4jHelper'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(Buefy)
Vue.use(VueCytoscape)
Vue.use(Neo4jHelper)

new Vue({
  render: h => h(App),
}).$mount('#app')
