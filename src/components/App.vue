<template>
<sub><a href="https://github.com/AaronDavidNewman/vue3base">Github </a> site.
<a href="https://aarondavidnewman.github.io/vue3base/">Readme</a> documentation</sub>
<h2>This is a demo of the Vue3 Composition API</h2>
      <div class="tabContent">
  <div class="itemPreferences">
    <div class="itemPropertiesContainer">
      <p>The select boxes implement a tree-like control.  This navigation tab serves no purpose.</p>
      <ul class="nav-tabs">
        <li class="nav-tab" :class="{ active: tabASelected }">
          <a class="nav-link" href @click.prevent="showTabA">Tab A</a>
        </li>
        <li class="nav-item" :class="{ active: tabBSelected }">
          <a class="nav-link" href @click.prevent="showTabB">Tab B</a>
        </li>
      </ul>
      <div class="tab-content">
        <div class="formSection tab-pane" :class="{ active: tabASelected }">
          <p class="stdSubIntro">Pick a tree, then pick branches</p>
          <treetop :treelist="treelist" :domId="domId" @tree-selected="treeSelected"></treetop>
          <div v-for="level in compLevels" :key="level.id">
            <treeview
              :items="level.items"
              :label="level.label"
              :id="level.id"
              :level="level.level"
              @level-selected="levelSelected"
              :domId="domId"
            >
            </treeview>
          </div>
        </div>
        <div class="formSection tab-pane" :class="{ active: tabBSelected }">
          <p class="stdSubIntro">Useless tabl here</p>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed } from 'vue';
import { default as manageTree } from '../composables/treeView';
import { default as treetop } from "./treetop.vue";
import { default as treeview } from "./treeview.vue";
export default {
  components: { treetop, treeview },
  props: {
    selectedTree: String,
    selectedLevel: Number,
    treelist: Array,
    domId: String, 
    compLevels: Array,
    tabASelected: Boolean,
    tabBSelected: Boolean,
    selectedTab: Number,
  },
  setup(props) {
    const selectedTree = ref('');
    const selectedLevel = ref(-1);
    const { compLevels, treelist } = manageTree(selectedTree, selectedLevel);
    const domId = props.domId;
    const selectedTab = ref(0);
    const tabASelected = computed(() => selectedTab.value === 0);
    const tabBSelected = computed(() => selectedTab.value === 1);
    return { selectedTree, selectedLevel, treelist, domId, compLevels, tabASelected, tabBSelected, selectedTab };
  },
  methods: {
    treeSelected(val) {
      this.selectedTree = val.value;
    },
    showTabA() {
      this.selectedTab = 0;
    },
    showTabB() {
      this.selectedTab = 1;
    },
    levelSelected(val) {
      this.selectedLevel = val.level;
    },
  },
};
</script>
<style>
.stdIntro {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.stdSubIntro {
  font-size: 0.85rem;
  padding: 0.5rem 0;
  margin-bottom: 0;
  font-style: italic;
  color: #555;
  line-height: 1.2;
}
.formSection {
  padding: 0.5em;
  border: 1px solid #e7e7e7;
  border-top: none;
}
.itemPropertiesContainer {
  flex-grow: 9;
  flex-shrink: 1;
  overflow: auto;
  padding: 10px;
  position: relative;
  z-index: 1;
}
.itemPreferences {
  border: solid 1px var(--items-bg-color);
  display: flex;
  flex-direction: column;
  opacity: 1;
  width: 300px;
}
.tabContent {
  display: flex;
  flex-direction: row;
  flex-grow: 9;
  flex-shrink: 0;
}
.nav-tabs > li {
  float: left;
  margin-bottom: -1px;
  list-style: none;
  position: relative;
}
.tab-content .tab-pane {
  display: none;
  visibility: hidden
}
.tab-content .tab-pane.active {
  display: block;
  visibility: visible
}
.nav-tabs > li > a {
  margin-right: 2px;
  line-height: 1.42857143;
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0
}
.nav-tabs > li > a:hover {
  border-color: #eee #eee #ddd
}
ul {
  padding: 0;
  display: inline-block;
  margin-block-end:0;
}
.nav-tabs .nav-link {
    margin-bottom: -1px;
    background: 0 0;
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
}
.nav-tabs .active .nav-link {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
    text-decoration: none;
}
.nav-tabs > li > a {
    position: relative;
    display: block;
    padding: 10px 15px;
}
</style>