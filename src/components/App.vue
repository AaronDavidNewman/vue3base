<template>
  <treetop :treelist="treelist" @tree-selected="treeSelected"></treetop>
  <div v-for="level in levels" :key="level.id">
    <treeview
      :items="level.items"
      :label="level.label"
      :id="level.id"
      :level="level.level"
      @level-selected="levelSelected"
    >
    </treeview>
  </div>
</template>
<script>
import { default as treetop } from "./treetop.vue";
import { default as treeview } from "./treeview.vue";
import { sampleData } from '../sampleData.js';
function getTreeList() {
  return sampleData.map((x) => {
    return { label: x.label, id: x.id, index: x.index };
  });
}
function getTree(treeId) {
  return sampleData.find((tree) => tree.id === treeId);
}
export default {
  components: { treetop, treeview },
  props: ["treelist"],
  data() {
    return {
      selectedTreeLabel: "",
      currentLevel: 0,
      levels: [],
      selectedTree: {},
      selectedValues: [],
    };
  },
  setup() {
    const treelist = getTreeList();
    return { treelist };
  },
  methods: {
    treeSelected(val) {
      this.currentLevel = -1;
      this.selectedTree = getTree(val.value);
      if (this.selectedTree && this.selectedTree.levels) {
        this.currentLevel = 0;
        this.levels = [];
        this.selectedValues = [];
        this.updateTree();
      }
    },
    updateTree() {
      const tree = this.selectedTree;
      if (tree && tree.levels) {
        tree.levels.forEach((level) => {
          // this.currentLevel is the tree level of the most recent change.  So update that row
          if (level.level === this.currentLevel) {
            // add if new, else just update
            if (this.levels.length <= this.currentLevel) {
              this.levels.push(level);
            } else {
              // Update all fields individually, so the Vue ref tracker informs the child.
              const ix = level.level;              
              this.levels[ix].level = level.level;
              this.levels[ix].id = level.id;
              this.levels[ix].label = level.label;
              this.levels[ix].items = level.items;
            }
          } else if (level.level > this.currentLevel) {
            // For levels above the current level, we don't know the value yet.  So empty it of items.
            // For levels below the current level, leave the values alone
            const levelObj = {
              level: level.level,
              id: level.id,
              label: level.label,
              items: [],
            };
            if (this.levels.length <= level.level) {
              this.levels.push(levelObj);
            } else {
              const ix = level.level;
              this.levels[ix].level = levelObj.level;
              this.levels[ix].id = levelObj.id;
              this.levels[ix].label = levelObj.label;
              this.levels[ix].items = [];
            }
          }
        });
      }
    },
    levelSelected(val) {
      if (this.selectedValues.length <= val.level) {
        this.selectedValues.push(val.value);
      } else {
        this.selectedValues[val.level] = val.value;
        var i = val.level + 1;
        const len = this.selectedValues.length;
        while (i < len) {
          this.selectedValues.pop();
          i += 1;
        }
      }
      if (val.level === this.currentLevel && this.selectedTree.levels.length > this.currentLevel + 1) {
        const ix = val.level + 1;
        const inst = this.selectedTree.levels[ix];
        this.levels[ix].level = inst.level;
        this.levels[ix].id = inst.id;
        this.levels[ix].label = inst.label;
        this.levels[ix].items = inst.items;
        this.currentLevel += 1;
      } else if (val.level < this.currentLevel) {
        if (this.levels.length > val.level + 1) {
          this.currentLevel = val.level + 1;
        } else {
          this.currentLevel = val.level;
        }
        this.updateTree();
      }
      console.log(JSON.stringify(this.selectedValues, null, ''));
    },
  },
};
</script>
