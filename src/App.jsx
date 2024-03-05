import React, { useState, useRef } from "react";
import Tree from "react-d3-tree";
import { useCenteredTree } from "./helpers";
import "./styles.css";
import mockedData from "../src/data/names.json"; // Assuming "names.json" contains the mock data

const containerStyles = {
  position: "relative",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#F2F2F2",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const buttonStyles = {
  position: "fixed",
  bottom: "20px",
  left: "20px",
  backgroundColor: "#AD2C92",
  color: "#F2F2F2",
  padding: "10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const orgChartJson = {
  name: "CEO",
  children: [
    {
      name: "Manager",
      children: [],
    },
    {
      name: "Manager",
      children: [],
    },
  ],
};

const renderRectSvgNode = ({ nodeDatum, onNodeClick }) => (
  <g>
    <circle r="10" onClick={onNodeClick} fill="#034C8C" />
    <text fill="#068BBF" strokeWidth="1" x="20">
      {nodeDatum.name}
    </text>
  </g>
);

// Mocked function to simulate the fetch and return the mocked data
const mockFetch = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        json: () => Promise.resolve(mockedData),
      });
    }, 1000); // Simulate a delay
  });
};

export default function App() {
  const [treeData, setTreeData] = useState(orgChartJson);
  const [translate, containerRef] = useCenteredTree();
  const prevTreeDataRef = useRef(treeData);

  const onNodeClick = (nodeData) => {
    const newNodeName = prompt("Enter the name for the new child node:");

    if (newNodeName) {
      const newChild = {
        name: newNodeName,
        children: [],
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

      setTreeData(updatedTreeData);
      prevTreeDataRef.current = updatedTreeData;
    }
  };

  const sendTreeData = async () => {
    try {
      // Simulate fetching data from the mocked endpoint
      const response = await mockFetch();
      const data = await response.json();

      console.log("Data sent successfully:", data);

      // Assuming the response data contains the updated tree structure
      if (data) {
        console.log(data);
        setTreeData(data);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div style={containerStyles} ref={containerRef}>
      <Tree
        data={treeData}
        translate={translate}
        renderCustomNodeElement={renderRectSvgNode}
        orientation="vertical"
        onNodeClick={onNodeClick}
      />

      <button style={buttonStyles} onClick={sendTreeData}>
        Send Tree Data
      </button>
    </div>
  );
}
