import React, { useEffect } from 'react';
import { Chart } from '@antv/g2';

const PieChartComponent = ({data}) => {
  useEffect(() => {
    const chart = new Chart({
      container: 'piechart-container', 
      autoFit: true,
    });


    chart.coordinate({ type: 'theta', innerRadius: 0.9 });
    chart
      .interval()
      .transform({ type: 'stackY' })
      .data(data) 
      .encode('y', 'total')
      .encode('color', 'type')
      .style('inset', 3)
      .style('radius', 8)
      .scale('color', {
        range: ['#cdfbe8', '#c7f3fa', '#5c6cf6', '#fcfbca', '#f3cbfb']
      })
      .label({
        text: 'type',
        fontWeight: 'bold',
        connectorDistance: 0,
        position: 'outside',
        offset: 14,
      })
      .label({
        text: (d, i, data) => (i < data.length - 3 ? d.total : '')+'%',
        position: 'spider',
        connectorDistance: 10,
        fontWeight: 'bold',
        textBaseline: 'bottom',
        textAlign:'start', 
        // (d) => (['c', 'sass'].includes(d.id) ? 'end' : 'start'),
        dy: -4,
      })
      .animate('enter', { type: 'waveIn' })
      .legend(false);

    chart.render();

    return () => {
      chart.destroy();
    };
  }, []); 

  return <div id="piechart-container" style={{ width: '320px', height: '180px' }} />; 
};

export default PieChartComponent;