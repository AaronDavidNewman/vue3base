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
const trees = [
  {
    id: "Tree1",
    label: "Tree 1",
    index: 0,
    levels: [
      {
        id: "0",
        label: "1-1",
        level: 0,
        items: [
          { id: "1-1-1", label: "1-1-1" },
          { id: "1-1-2", label: "Second branch" },
        ],
      },
      {
        id: "2",
        label: "1-2",
        level: 1,
        items: [
          { id: "1-2-1", label: "1-2-1" },
          { id: "1-1-2", label: "Second lvl 2nd branch" },
        ],
      },
      {
        id: "3",
        label: "1-3",
        level: 2,
        items: [
          { id: "1-2-1", label: "1-2-1" },
          { id: "1-1-2", label: "Second lvl 2nd branch" },
        ],
      },
    ],
  },
  {
    id: "Tree2",
    label: "Tree 2",
    index: 1,
    levels: [
      {
        id: "0",
        label: "2-1",
        level: 0,
        items: [
          { id: "2-1-1", label: "2-1-1" },
          { id: "1-1-2", label: "Second branch" },
        ],
      },
      {
        id: "2",
        label: "1-2",
        level: 1,
        items: [
          { id: "2-2-1", label: "2-2-1" },
          { id: "2-2-2", label: "other branch" },
        ],
      },
      {
        id: "3",
        label: "1-3",
        level: 2,
        items: [
          { id: "2-3-1", label: "2-3-1" },
          { id: "2-3-2", label: "olive branch" },
        ],
      },
      {
        id: "4",
        label: "1-3",
        level: 3,
        items: [
          { id: "2-4-1", label: "2-3-1" },
          { id: "2-4-2", label: "ultimate branch" },
        ],
      },
    ],
  },
];
function getTreeList() {
  return trees.map((x) => {
    return { label: x.label, id: x.id, index: x.index };
  });
}
function getTree(treeId) {
  return trees.find((tree) => tree.id === treeId);
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
          if (level.level === this.currentLevel) {
            if (this.levels.length <= this.currentLevel) {
              this.levels.push(level);
            } else {
              this.levels[level.level] = level;
            }
          } else {
            const levelObj = {
              root: tree.id,
              level: level.level,
              id: level.id,
              label: level.label,
              items: [],
            };
            if (this.levels.length <= level.level) {
              this.levels.push(levelObj);
            } else {
              this.levels[level] = levelObj;
            }
          }
        });
      }
    },
    levelSelected(val) {
      if (this.selectedValues.length <= val.level) {
        this.selectedValues.push(val.value);
      } else {
        this.selectedValues[val.value] = val.value;
      }
      if (val.level === this.currentLevel && this.selectedTree.levels.length > this.currentLevel + 1) {
        this.levels[val.level + 1] = this.selectedTree.levels[val.level + 1];
        this.currentLevel += 1;
      } else if (val.level < this.currentLevel) {
        this.currentLevel = val.level;
        this.updateTree();
      }
    },
  },
};
</script>
