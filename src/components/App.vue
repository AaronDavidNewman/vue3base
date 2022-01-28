<template>
  <div class="tabContent">
    <div class="itemPreferences">
      <div class="itemPropertiesContainer">
        <div class="formSection">
          <ul class="nav-tabs">
            <li class="nav-tab">
              <p class="stdSubIntro">Words go here</p>
              <treetop
                :treelist="treelist"
                @tree-selected="treeSelected"
              ></treetop>
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
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { default as treetop } from "./treetop.vue";
import { default as treeview } from "./treeview.vue";
import { sampleData } from "../sampleData.js";
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
        this.levels.splice(0);
        this.selectedValues.splice(0);
        this.updateTree();
      }
    },
    createEmptyTreeNode(node) {
      return {
        level: node.level,
        id: node.id,
        label: node.label,
        items: [],
      };
    },
    copyTreeNode(node) {
      const rv = this.createEmptyTreeNode(node);
      node.items.forEach((item) => {
        rv.items.push({
          id: item.id,
          label: item.label,
        });
      });
      return rv;
    },
    clearComponentNode(compNode, treeNode) {
      compNode.level = treeNode.level;
      compNode.id = treeNode.id;
      compNode.label = treeNode.label;
      compNode.items.splice(0);
    },
    updateComponentNode(compNode, treeNode) {
      this.clearComponentNode(compNode, treeNode);
      treeNode.items.forEach((item) => {
        compNode.items.push({ id: item.id, label: item.label });
      });
    },
    updateTree() {
      const tree = this.selectedTree;
      if (tree && tree.levels) {
        tree.levels.forEach((level) => {
          // this.currentLevel is the tree level of the most recent change.  So update that row
          if (level.level === this.currentLevel) {
            // add if new, else just update
            if (this.levels.length <= this.currentLevel) {
              this.levels.push(this.copyTreeNode(level));
            } else {
              // Update all fields individually, so the Vue ref tracker informs the child.
              // We want the list for each level, but we don't want the tree values until the parent is picked
              const ix = level.level;
              this.updateComponentNode(this.levels[ix], level);
            }
          } else if (level.level > this.currentLevel) {
            // For levels above the current level, we don't know the value yet.  So empty it of items.
            // For levels below the current level, leave the values alone
            if (this.levels.length <= level.level) {
              this.levels.push(this.createEmptyTreeNode(level));
            } else {
              const ix = level.level;
              this.clearComponentNode(this.levels[ix], level);
            }
          }
        });
      }
    },
    levelSelected(val) {
      if (this.selectedValues.length <= val.level) {
        this.selectedValues.push(val.value);
      } else {
        // If the level selected is above the latest selected value,
        // clear the values below.
        this.selectedValues[val.level] = val.value;
        var i = val.level + 1;
        const len = this.selectedValues.length;
        while (i < len) {
          this.selectedValues.pop();
          i += 1;
        }
      }
      if (
        val.level === this.currentLevel &&
        this.selectedTree.levels.length > this.currentLevel + 1
      ) {
        // We have selected a value at a tree level, and there is at least one branch
        // further down the tree.
        const ix = val.level + 1;
        const inst = this.selectedTree.levels[ix];
        this.updateComponentNode(this.levels[ix], inst);
        this.currentLevel += 1;
      } else if (val.level < this.currentLevel) {
        if (this.levels.length > val.level + 1) {
          this.currentLevel = val.level + 1;
        } else {
          this.currentLevel = val.level;
        }
        this.updateTree();
      }
      console.log(JSON.stringify(this.selectedValues, null, ""));
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
}
</style>