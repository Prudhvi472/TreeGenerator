import React, { useState, useRef, useEffect } from "react";
import Select from "react-select"; // Install "react-select" package

import Tree from "react-d3-tree";
import { useCenteredTree } from "./helpers"; // Assuming this helper component exists
import "./styles.css";
import mockedData from "../src/data/names.json";

const containerStyles = {
  position: "relative",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#F2F2F2",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const boxStyles = {
  // position: "fixed",
  // bottom: "20px",
  // left: "20px",
  backgroundColor: "white",
  margin: "10px",
  padding: "10px",
  border: "1px solid #ccc",
  width: "200px",
};

const modifiedBoxStyles = {
  ...boxStyles, // Inherit styles from boxStyles
  minWidth: "200px", // Set minimum width to ensure content fits
  marginRight: "10px", // Add margin for spacing between boxes
};

const buttonStyles = {
  // position: "fixed",
  // bottom: "20px",
  // left: "calc(20px + 200px)", // Adjust left position based on the width of the fixed boxes
  backgroundColor: "#AD2C92",
  color: "#F2F2F2",
  padding: "10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const SelectgStyles = {
  // Adjust left position based on the width of the fixed boxes and the button
  padding: "80px",
  border: "none",
  borderRadius: "5px",
  margin: "10px",
  width: "200px",
};

const bottomContainerStyles = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const orgChartJson = {
  name: "Feature1 = 1",
  rules: "Feature1 = 1",
  children: [
    {
      name: "Feature2 < 550",
      rules: "Feature2 < 550",
      children: [
        {
          name: "Feature3 < 11",
          rules: "Feature3 < 11",
          children: [
            {
              name: "Policy Rule 1",
              rules: "Policy Rule 1",
            },
          ],
        },
        {
          name: "Feature3 >= 11 and Feature3 <= 9990",
          rules: "Feature3 >= 11 and Feature3 <= 9990",
          children: [
            {
              name: "Policy Rule 2",
              rules: "Policy Rule 2",
            },
          ],
        },
        {
          name: "Feature3 > 9990 and Feature3 <= 9999",
          rules: "Feature3 > 9990 and Feature3 <= 9999",
          children: [
            {
              name: "Feature4 < 100",
              rules: "Feature4 < 100",
              children: [
                {
                  name: "Policy Rule 3",
                  rules: "Policy Rule 3",
                },
              ],
            },
            {
              name: "Feature4 >= 100 and Feature4 <= 990",
              rules: "Feature4 >= 100 and Feature4 <= 990",
              children: [
                {
                  name: "Policy Rule 4",
                  rules: "Policy Rule 4",
                },
              ],
            },
            {
              name: "Feature4 > 990 and Feature4 <= 999",
              rules: "Feature4 > 990 and Feature4 <= 999",
              children: [
                {
                  name: "Policy Rule 5",
                  rules: "Policy Rule 5",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Feature2 >= 550 and Feature2 < 630",
      rules: "Feature2 >= 550 and Feature2 < 630",
      children: [
        {
          name: "Feature3 < 10",
          rules: "Feature3 < 10",
          children: [
            {
              name: "Policy Rule 6",
              rules: "Policy Rule 6",
            },
          ],
        },
        {
          name: "Feature3 >= 10 and Feature3 <= 9990",
          rules: "Feature3 >= 10 and Feature3 <= 9990",
          children: [
            {
              name: "Feature5 < 2",
              rules: "Feature5 < 2",
              children: [
                {
                  name: "Feature6 < 20",
                  rules: "Feature6 < 20",
                  children: [
                    {
                      name: "Policy Rule 7",
                      rules: "Policy Rule 7",
                    },
                  ],
                },
                {
                  name: "Feature6 >= 20 and Feature6 < 45",
                  rules: "Feature6 >= 20 and Feature6 < 45",
                  children: [
                    {
                      name: "Policy Rule 8",
                      rules: "Policy Rule 8",
                    },
                  ],
                },
                {
                  name: "Feature6 >= 45 and Feature6 <= 990",
                  rules: "Feature6 >= 45 and Feature6 <= 990",
                  children: [
                    {
                      name: "Policy Rule 9",
                      rules: "Policy Rule 9",
                    },
                  ],
                },
              ],
            },
            {
              name: "Feature5 >= 2 and Feature5 <= 90",
              rules: "Feature5 >= 2 and Feature5 <= 90",
              children: [
                {
                  name: "Feature7 < 60",
                  rules: "Feature7 < 60",
                  children: [
                    {
                      name: "Policy Rule 10",
                      rules: "Policy Rule 10",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const renderRectSvgNode = ({ nodeDatum, onNodeClick }) => (
  <g>
    <circle r="10" onClick={onNodeClick} fill="#034C8C" />
    <text fill="#068BBF" strokeWidth="1" x="20">
      {nodeDatum.name}
    </text>
    {nodeDatum.rules && (
      <text fill="black" x="20" dy="20" strokeWidth="1">
        Rule :{nodeDatum.rules}
      </text>
    )}
  </g>
);

// Mocked function to simulate the fetch and return the mocked data
const mockFetch = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        json: () => Promise.resolve(mockedData),
      });
    }, 1000);
  });
};

const gatherLeafNodeRules = (node, parentRules = [], leafNodes = {}) => {
  if (node.children && node.children.length > 0) {
    // Non-leaf node
    const updatedParentRules = node.rules
      ? [...parentRules, node.rules]
      : parentRules;
    node.children.forEach((child) =>
      gatherLeafNodeRules(child, updatedParentRules, leafNodes)
    );
  } else {
    // Leaf node
    const leafNodeRules = parentRules.concat(node.rules || []);
    leafNodes[node.name] = leafNodeRules;
  }
  return leafNodes;
};

export default function App() {
  const [treeData, setTreeData] = useState(orgChartJson);
  const [translate, containerRef] = useCenteredTree();
  const prevTreeDataRef = useRef(treeData);
  const [selectedLeafNode, setSelectedLeafNode] = useState(null);
  const [apiOutput, setApiOutput] = useState("");
  const leafNodesWithRules = gatherLeafNodeRules(treeData);
  const [selectedNodeRules, setSelectedNodeRules] = useState(null);

  useEffect(() => {
    // Gather leaf nodes on initial render and data changes
    const leafNodes = gatherLeafNodeRules(treeData);
    setSelectedLeafNode(leafNodes[Object.keys(leafNodes)[0]]); // Select first leaf node by default
    const options = Object.keys(leafNodes).map((name) => ({
      value: name,
      label: name,
    }));
    setOptions(options); // Update options state
    return () => {}; // Cleanup function (optional)
  }, [treeData]);

  const [options, setOptions] = useState([]);

  const onNodeClick = (nodeData) => {
    const newNodeName = prompt("Enter the name for the new child node:");
    const newRules = prompt("Enter rules for the node (optional):");

    if (newNodeName !== null) {
      const newChild = {
        name: newNodeName,
        children: [],
        rules: newRules || undefined,
      };

      const updatedTreeData = { ...prevTreeDataRef.current };

      const targetNodeName = nodeData.data.name;
      const targetAttributes = nodeData.data.attributes;

      const findAndAddChild = (
        parent,
        targetNode,
        targetParentName,
        targetParentAttributes
      ) => {
        if (
          parent.name === targetParentName &&
          (targetParentAttributes === undefined ||
            JSON.stringify(parent.attributes) ===
              JSON.stringify(targetParentAttributes))
        ) {
          parent.children.push(newChild);
          return;
        }

        if (parent.children) {
          parent.children.forEach((child) =>
            findAndAddChild(
              child,
              targetNode,
              targetParentName,
              targetParentAttributes
            )
          );
        }
      };

      findAndAddChild(updatedTreeData, null, targetNodeName, targetAttributes);
      console.log(updatedTreeData);
      setTreeData(updatedTreeData);
      const leafNodesWithRules = gatherLeafNodeRules(treeData);
      console.log(leafNodesWithRules);
      prevTreeDataRef.current = updatedTreeData;
    }
  };

  const sendTreeData = async () => {
    try {
      const leafNodesWithRules = gatherLeafNodeRules(treeData);
      console.log(leafNodesWithRules);
      const response = await mockFetch();
      const data = await response.json();

      console.log("Data sent successfully:", data);

      if (data) {
        console.log(data);
        setApiOutput(data); // Set the API output string
        setTreeData(data);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleLeafNodeSelect = (selectedOption) => {
    const selectedNodeName = selectedOption.value;
    setSelectedNodeRules(leafNodesWithRules[selectedNodeName] || null);
  };

  return (
    <div style={containerStyles} ref={containerRef}>
      <Tree
        data={treeData}
        translate={translate}
        renderCustomNodeElement={renderRectSvgNode}
        orientation="vertical"
        onNodeClick={onNodeClick}
        separation={{ siblings: 2, nonSiblings: 2.5 }}
      />

      <div style={bottomContainerStyles}>
        <Select
          // styles={SelectStyles}
          onChange={handleLeafNodeSelect}
          options={options}
          placeholder="Select a leaf node"
          menuPlacement="top"
        />
        <button style={buttonStyles} onClick={sendTreeData}>
          Explain Tree
        </button>
        <div style={modifiedBoxStyles}>
          Selected Node Rules:
          {selectedNodeRules ? (
            <ul>
              {selectedNodeRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          ) : (
            "No rules selected"
          )}
        </div>
        <div style={modifiedBoxStyles}>
          <p>API Output (string below 50 characters):</p>
        </div>
      </div>
    </div>
  );
}
