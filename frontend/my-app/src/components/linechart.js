import React, { useEffect } from 'react';
import { Chart } from '@antv/g2';
import './index.css';

const LineChartComponent = ({data}) => {
  useEffect(() => {
    const chart = new Chart({
      container: 'linechart-container', 
      autoFit: true,
    });

    chart
    .data(data)
    const filteredData = data.filter((d, index) => index % 2 === 0);

    // chart.schema().position('year*total').shape('circle').size(5);

    const maxTotal = Math.max(...data.map(d => d.total));
    const minTotal = 0; 
    function fillOpacityMapper(value) {
      const baseValue = 0; // 基础值，接近这个值时透明度最高
      const opacityRange = [1, 0]; // 透明度范围，从完全不透明到完全透明
      const valueRange = [0, maxTotal]; // 数据值的范围，根据您的数据实际调整
    
      // 根据数据值线性映射到透明度
      const opacity = opacityRange[0] + (value - baseValue) / (valueRange[1] - baseValue) * (opacityRange[1] - opacityRange[0]);
      return opacity;
    }
    // chart.guide().region({
    //   start: ['min(year)', minTotal],
    //   end: ['max(year)', maxTotal],
    //   style: {
    //     fill: 'l(270) 0:rgba(0,0,0,0) 1:#a7f9ce', 
    //   },
    // });
    chart
    .area()
    .encode('shape', 'smooth')
    .style({  fill: 'l(90) 0:#a7f9ce 0.5:#4e7460 1:rgba(0,0,0,0)',  });

    chart
    .encode('x', 'year')
    .encode('y', 'total')
    .encode('color', 'type')
    .scale('x', {
        range: [0, 1],
    })
    .scale('y', {
        nice: true,
    })
    .axis('x', { style: {title: false, labelFill: '#a7f9ce', line:true, lineStroke:'#a7f9ce',tickStroke:'#a7f9ce'} })
    .axis('y', { style: {title: false, labelFill: '#a7f9ce'} })
    // .axis('y', { labelFormatter: (d) => d + '°C' });
    // chart.legend('type',{
    //   position: "top",
    //   flipPage: false,
    //   itemMarkerFill: "#fff", // 设置图例标记的颜色
    //   itemLabelFill: "#FFFFFF", // 设置图例标签字体颜色
    // });
    chart.legend('color', {
      position: "top",
      itemLabelFill: "#FFFFFF",
      itemLabelFontSize: 10,
    });

    chart.line().encode('shape', 'smooth');
    chart.render();

    return () => {
      chart.destroy();
    };
  }, []); 

  return <div id="linechart-container" style={{ width: '300px', height: '140px' }} />; 
};

export default LineChartComponent;