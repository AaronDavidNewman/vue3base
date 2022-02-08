import { reactive, watch } from 'vue';
import { getTreeListXhr, getTreeLevelXhr, getTreeXhr } from '../repos/sampleData';

export default function manageTree(treeSelectionRef, levelSelectionRef) {
    const treelist = reactive([]);  // list of all available trees
    const compLevels = reactive([]); // branches of each level of the current tree
    let currentLevel = -1; // current level of the tree we're on
    let selectedTreeId = '';

    async function populateTreeList() {
        treelist.splice(0);
        const treeData = await getTreeListXhr();
        treeData.forEach((tt) => {
            treelist.push({
                id: tt.id,
                label: tt.label
            });
        });
    }
    // get a tree and all the levels.  The first
    // level of the tree will have all the branches
    async function treeSelected(value) {
        selectedTreeId = value;
        compLevels.splice(0);
        const tree = await getTreeXhr(value);
        currentLevel = 0;
        levelSelectionRef.value = -1;
        const lvl0 = await getTreeLevelXhr(tree.id, 0);
        tree.levels.forEach((lvl) => {
            compLevels.push({
                id: lvl.id,
                label: lvl.label,
                level: lvl.level,
                items: []
            });
            if (lvl.level === 0) {
                lvl0.items.forEach((item) => {
                    compLevels[0].items.push({ id: item.id, label: item.label });
                });
            }
        });
    }
    async function getTreeLevel(lvlIndex) {
        var i = 0;
        if (compLevels.length <= lvlIndex + 1) {
            return;
        }
        currentLevel = lvlIndex + 1;
        // Clear out any levels beyond this one
        for (i = currentLevel; i < compLevels.length; ++i) {
            compLevels[i].items.splice(0);
        }
        const lvl = await getTreeLevelXhr(selectedTreeId, currentLevel);
        const compNode = compLevels[currentLevel];
        compNode.id = lvl.id;
        compNode.label = lvl.label;
        compNode.level = lvl.level;
        compNode.items.splice(0);
        setTimeout(() => {
            lvl.items.forEach((ii) => {
                compNode.items.push({ id: ii.id, label: ii.label });
            });
    
        });
        // updateTree();
    }
    populateTreeList();
    watch(treeSelectionRef, (value) => {
        treeSelected(value);
    });
    watch(levelSelectionRef, (value) => {
        getTreeLevel(value);
    });
    return { compLevels, treelist };
}