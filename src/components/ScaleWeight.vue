<template>
  <div>
    <q-list bordered separator>
      <q-item>
        <q-item-section>Poids du contenant :</q-item-section>
        <q-item-section>{{ jarWeight }} g </q-item-section>
      </q-item>
      <q-item>
        <q-item-section> poids du produit :</q-item-section>
        <q-item-section>{{ productWeight }} g </q-item-section>
      </q-item>
    </q-list>
    <div v-if="errorScale">
      {{ errorScale }}
    </div>
  </div>
</template>

<script>
import { Balance } from '../app/portbalance'

export default {
  name: 'ScaleWeight',
  components: {},
  computed: {
    productWeight() {
      return this.$store.state.weights.product
    },
    jarWeight() {
      return this.$store.state.weights.jar
    },
  },
  data() {
    return {
      scale: null,
      errorScale: false,
      ecouteBalance: null,
    }
  },
  async mounted() {
    try {
      this.scale = new Balance(process.env.VUE_APP_SCALE, this.getWeight)
      await this.connectScale()
      await this.disconnectScale()
    } catch (err) {
      console.log(err)
    }
  },
  methods: {
    async disconnectScale() {
      this.raz()
      await this.scale.finEcoute()
    },

    async connectScale() {
      await this.scale.debutEcoute()
    },
    getWeight(ecoute, err, poids) {
      this.ecouteBalance = ecoute
      if (err) {
        this.errorScale = err
        this.$store.dispatch('setProductWeight', 0)
      } else {
        this.errorScale = false
        const poidsProduit = ecoute ? poids : 0
        this.$store.dispatch('setProductWeight', poidsProduit)
        if (this.productWeight === 0) {
          // Le processus de pesée est réinitialisé à chaque fois que la balance annonce qu'il n'y a rien sur le plateau
          this.raz()
        }
      }
    },
    raz() {
      this.$store.dispatch('setProductWeight', 0)
      this.$store.dispatch('setJarWeight', 0)
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
