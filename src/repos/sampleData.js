export async function getTreeListXhr() {
  return sampleData.map((x) => {
    return { label: x.label, id: x.id, index: x.index };
  });
}
export async function getTreeXhr(treeId) {
  const tree = sampleData.find((tree) => tree.id === treeId);
  const rv = {
    id: tree.id,
    label: tree.label,
    levels: []
  };
  tree.levels.forEach((level) => {
    rv.levels.push({
      id: level.id,
      label: level.label,
      level: level.level,
      items: []
    });
  });
  return tree;
}
export async function getTreeLevelXhr(treeId, level) {
  return sampleData.find((tree) => tree.id === treeId).levels[level];
}

export const sampleData = [
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
          { id: "1-2-2", label: "Second lvl 2nd branch" },
        ],
      },
      {
        id: "3",
        label: "1-3",
        level: 2,
        items: [
          { id: "1-3-1", label: "1-3-1" },
          { id: "1-3-2", label: "Third lvl 2nd branch" },
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
          { id: "2-1-2", label: "Second branch" },
        ],
      },
      {
        id: "2",
        label: "2-2",
        level: 1,
        items: [
          { id: "2-2-1", label: "2-2-1" },
          { id: "2-2-2", label: "other branch" },
        ],
      },
      {
        id: "3",
        label: "2-3",
        level: 2,
        items: [
          { id: "2-3-1", label: "2-3-1" },
          { id: "2-3-2", label: "olive branch" },
          { id: "2-3-3", label: "cows" },
        ],
      },
      {
        id: "4",
        label: "2-4",
        level: 3,
        items: [
          { id: "2-4-1", label: "2-4-1" },
          { id: "2-4-2", label: "ultimate branch" },
        ],
      },
    ],
  },
];