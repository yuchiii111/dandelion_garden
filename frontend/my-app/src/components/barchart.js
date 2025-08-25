import React, { useEffect } from 'react';
import { Chart } from '@antv/g2';

const BarChartComponent = ({data}) => {
  useEffect(() => {
    const chart = new Chart({
      container: 'barchart-container', 
      autoFit: true,
    });

    chart
      .interval()
      .coordinate({ transform: [{ type: 'transpose' }] })
      .data(data)
      .encode('x', 'type')
      .encode('y', 'total')
      .style('radius', 4)
      .style('fill', '#a7f9ce')
      .axis('y', { style: {title: false, labelFill: '#a7f9ce', line:true, lineStroke:'#a7f9ce',tickStroke:'#a7f9ce'} })
      .axis('x', { style: {title: false, labelFill: '#a7f9ce'} })

    chart.render();

    return () => {
      chart.destroy();
    };
  }, []); 

  return <div id="barchart-container" style={{ width: '300px', height: '140px' }} />; 
};

export default BarChartComponent;