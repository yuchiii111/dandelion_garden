import Picfetch from "../app/pic";
import Tooltipfetch from '../app/loadtooltip'
import React, { useRef } from 'react';
import PieChartComponent from "./piechart";

const ChartDisplay = ({ node }) => {
  const infodata = useRef(null);

  if(!node){
      return null;
  }
  Tooltipfetch(node.id,(tooltipdata) => {
    console.log(tooltipdata)
    infodata.current = tooltipdata
  });
  const infoStyle = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '250px',
      height: '250px',
      backgroundColor: 'rgba(30, 30, 30, 0.8)',
      color: 'white',
      borderColor:'#a7f9ce',
      padding: '10px',
      zIndex: 100,
      textAlign: 'center',
      borderRadius: '15px',
      // position: 'absolute', 
      borderWidth:'0.01px',
      opacity:'0.98',
      borderStyle:'solid',/* 定义边框的样式为实线 */
      // marginTop: '10%',
      // marginRight: '10%',
      // transform: 'translate(-50%, -50%)', 
  };
  // const handleHideInfo = () => {
  //     if (onDismiss) {
  //       onDismiss();
  //     }
  // };
  const handleBarData = (data) => { 
    const bardata = [
      {type:"papers", total:data.summary.total_papers || 0},
      {type:"projects", total:data.summary.total_projects || 0},
      {type:"patents", total:data.summary.total_patents || 0},
      {type:"awards", total:data.summary.total_awards || 0},
      {type:"publications", total:data.summary.total_publications || 0}
    ]
    console.log(bardata)
    return bardata 
  }
  
  return infodata.current ? (
      <div className='chart-content' style={infoStyle}>
        <div className='chart-detail' style={{ marginBottom: 'auto' }}>
        <PieChartComponent data={handleBarData(infodata.current)}/>
        </div>
        {/* <button style={{ background: 'none', border: 'none', color: 'white' }} onClick={handleHideInfo}>close</button> */}
      </div>
      ) : null;
  
  };

  export default ChartDisplay;