import * as THREE from 'three';
import { handleRaycaster } from '../sys/handleRaycaster';
import { showTooltip, hideTooltip } from './tooltip';

export const onMouseMove = (event, setTooltipDisplayTimeout, tooltipDisplayTimeout, latestMouseProjection) => {
    event.preventDefault();
    // console.log("move")

    handleRaycaster(event, (intersectedObject, intersectPoint) => {
      // console.log(intersectPoint)
      if (intersectedObject && intersectPoint) {
        latestMouseProjection.current = intersectPoint

        if (tooltipDisplayTimeout) {
            clearTimeout(tooltipDisplayTimeout);
        }

        const timeout = setTimeout(() => {
            showTooltip({hoveredObj:intersectedObject, latestMouseProjection:latestMouseProjection });
        }, 330);
        setTooltipDisplayTimeout(timeout);
      } else {
        hideTooltip();
        latestMouseProjection.current = null;
        // setHoveredObj(null);
        if (tooltipDisplayTimeout) {
            clearTimeout(tooltipDisplayTimeout);
        }
      }
    });
  };