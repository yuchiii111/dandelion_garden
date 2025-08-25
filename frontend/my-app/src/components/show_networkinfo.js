import InfoDisplay from "./infobar";
import React from 'react';
import { createRoot } from 'react-dom/client';

let networkinfobarRoot = null;

function initializenetworkInfobarRoot(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        networkinfobarRoot = createRoot(container);
    }
  }
  
const updatenetworkInfoDisplay = ({node, instanceId, hide}) => {
    if (!networkinfobarRoot) {
        console.error('Tooltip root not initialized.');
        return;
      }
    if (hide) {
        networkinfobarRoot.render(null);
        return;
    }
    console.log(1)
    console.log(node)
    console.log(instanceId)
    if(node && instanceId){
        console.log(2)
        const infobarContent = (
            <InfoDisplay
                node={node}
                instanceId={instanceId}
            />
        );  
        networkinfobarRoot.render(infobarContent);
    }

}


export {initializenetworkInfobarRoot, updatenetworkInfoDisplay};