<template>
  <section class="section">
    <div class="container">
      <h1 class="title">SISの中で同じ趣味を持つ人は？</h1>
      <b-tabs v-model="activeTab" destroy-on-hide>
        <b-tab-item label="人から探す">
          <People />
        </b-tab-item>
        <b-tab-item label="趣味から探す">
          <Hobbies />
        </b-tab-item>
      </b-tabs>
    </div>
  </section>
</template>

<script>
import People from './People.vue'
import Hobbies from './Hobbies.vue'

export default {
  name: 'Home',
  components: {
    People,
    Hobbies
  },
  data: function () {
    return {
      activeTab: 0
    }
  }
}
</script>

<style scoped>
</style>
