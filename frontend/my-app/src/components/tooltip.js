import Toolltip from './tooltipp';
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

let tooltipRoot = null;

function initializeTooltipRoot(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      tooltipRoot = createRoot(container);
    }
  }
  

const showTooltip = ({hoveredObj, latestMouseProjection, instanceId}) => {
    // const tooltipElement = document.getElementById('tooltip');
    // if (tooltipElement && hoveredObj.userData.tooltipText) {
    //     // tooltipElement.textContent = hoveredObj.userData.node.id;         
        
    //     console.log('tooltip')
    //     // console.log(latestMouseProjection.current);
        
    //     if (latestMouseProjection.current){
    //       const offsetX = latestMouseProjection.current.x + 10.0;
    //       const offsetY = latestMouseProjection.current.y + 10.0;
    //       const tooltipContent = hoveredObj.userData.tooltipText ? `
    //         <div className='tooltipcontent'; style="margin-left: ${offsetX}px; margin-top: ${offsetY}px; text-align: center;  padding: 5px; background-color: rgba(30, 30, 30, 0.8); color: rgba(255, 255, 255, 0.8); border-radius: 10px;">
    //           <div class="tooltip-header"; style="font-size: 16px; font-weight: bold; text-align: left;">
    //             <p><span style="background-color: rgba(185, 247, 212);">&nbsp</span><span>&nbsp&nbsp&nbsp${hoveredObj.userData.tooltipText.name} Hui Li&nbsp&nbsp&nbsp</span><span style="background-color: rgba(185, 247, 212); color: rgba(30, 30, 30, 0.8); border-radius: 10px ; padding: 5px; font-size: 14px;">教授</span></p>
    //           </div>
    //           <div class="tooltip-body"; style="width: 300px; font-size: 14px; text-align: left;">
    //             <p style="margin: 5px 0;"><span style="font-weight: bold;">电子邮箱：</span><a style="color: white;" href="mailto:hli@tongji.edu.cn">hli@tongji.edu.cn</a></p>
    //             <p style="margin: 5px 0;"><span style="font-weight: bold;">学历：</span> 博士研究生毕业</p>
    //             <p style="margin: 5px 0;"><span style="font-weight: bold;">学位：</span> 哲学博士学位</p>
    //             <p style="margin: 5px 0;"><span style="font-weight: bold;">毕业院校:</span> 美国加州大学Davis分校</p>
    //             <p style="margin: 5px 0;"><span style="font-weight: bold;">学科：</span> 交通运输工程 | 城市交通交通运输</p>
    //           </div>
    //         </div>
    //       ` : '';          
    //       tooltipElement.innerHTML = tooltipContent;
    //       tooltipElement.classList.add('tooltip-visible');
      
    //     }
    // }
    if (!tooltipRoot) {
        console.error('Tooltip root not initialized.');
        return;
      }
    
      if (hoveredObj && instanceId) {
        // console.log(instanceId)
        const tooltipContent = (
          <Toolltip
            hoveredObj={hoveredObj}
            latestMouseProjection={latestMouseProjection}
            instanceId={instanceId}
          />
        );
        document.getElementById('tooltip-container').classList.add('tooltip-visible');

        tooltipRoot.render(tooltipContent);
      }
  };

  const hideTooltip = () => {
    // const tooltipElement = document.getElementById('tooltip');
    // if (tooltipElement) {
    //     console.log('hide')
    //     // tooltipElement.style.display = 'none';
    //     // tooltipElement.style.opacity = 0.0;
    //     tooltipElement.classList.remove('tooltip-visible');
    // }
    const tooltipContainer = document.getElementById('tooltip-container');

    if (tooltipContainer) {
    //   const root = ReactDOM.createRoot(tooltipContainer);
    //   root.unmount();
      tooltipContainer.classList.remove('tooltip-visible');
    }
  };
  export {showTooltip, hideTooltip, initializeTooltipRoot};