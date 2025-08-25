import InfoDisplay from "./infobar";
import React from 'react';
import { createRoot } from 'react-dom/client';
import ChartDisplay from "./chartcontainer";

let infobarRoot = null;

function initializeInfobarRoot(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        infobarRoot = createRoot(container);
    }
  }
  
const updateInfoDisplay = (node, hide) => {
    if (!infobarRoot) {
        console.error('Tooltip root not initialized.');
        return;
      }
    const infobarContent = (
        <ChartDisplay
            node={node}
        />
    );  
    infobarRoot.render(infobarContent);

}


export {initializeInfobarRoot, updateInfoDisplay};