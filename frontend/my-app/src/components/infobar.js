import Picfetch from "../app/pic";
import Tooltipfetch from '../app/loadtooltip'
import React, { useRef } from 'react';
import BarChartComponent from "./barchart";
import LineChartComponent from "./linechart";
const InfoDisplay = ({ node, instanceId }) => {
  const infodata = useRef(null);

  if(!node){
      return null;
  }
  Tooltipfetch(instanceId,(tooltipdata) => {
    console.log(tooltipdata)
    infodata.current = tooltipdata
  });
  const infoStyle = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '300px',
      height: '350px',
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
      {type:"awards", total:data.summary.total_awards || 0},
      {type:"papers", total:data.summary.total_papers || 0},
      {type:"patents", total:data.summary.total_patents || 0},
      {type:"projects", total:data.summary.total_projects || 0},
      {type:"publications", total:data.summary.total_publications || 0}
    ]
    console.log(bardata)
    return bardata 
  }
  const handleLineData = (unfiltereddata) => { 
    const relevantKeys = ['awards', 'papers', 'patents', 'projects', 'publications'];
    const data = {};
    relevantKeys.forEach((key) => {
      if (unfiltereddata.hasOwnProperty(key)) {
        data[key] = unfiltereddata[key];
      }
    });
    const linedata  = [];
    Object.keys(data).forEach((type) => {
      Object.keys(data[type]).forEach((year) => {
        linedata.push({
          type: type,       
          year: parseInt(year, 10), 
          total: data[type][year]  
        });
      });
    });
    console.log(linedata)
    return linedata 
  }
  return infodata.current ? (
      <div className='info-content' style={infoStyle}>
        {/* <div className='info-header' style={{ marginBottom: 'auto' }}>
          <div className="info-headertext">
            <p>{infodata.current.teacher.teachership}</p>
            <p>教师编号：{infodata.current.teacher.techea_id}</p>
            <p>教师拼音名称：{infodata.current.teacher.name_pinyin}</p>
            <p>工作单位：{infodata.current.teacher.work_unit}</p>
            <p>学科：{infodata.current.teacher.discipline2}</p>
            <p>{infodata.current.teacher.discipline1}</p>
            <p>{infodata.current.teacher.discipline}</p>
          </div>
          <div className="info-headerimage">
            <div class="info-image">
              <Picfetch id={node.id}/>
            </div>
            <p>{node.name}</p>
          </div>
        </div> */}
        <div className='info-detail' style={{ marginBottom: 'auto' }}>
          <div className='info-detail-text'>
            <h3>
              {/* <span class="vertical-line" /> */}
              论文成果--类型
            </h3>
          </div>
          <BarChartComponent data={handleBarData(infodata.current)}/>
          <hr class="horizon-line"/>
          <h3>论文成果--时间</h3>
          <LineChartComponent  data={handleLineData(infodata.current.summary)}/>
        </div>
        {/* <button style={{ background: 'none', border: 'none', color: 'white' }} onClick={handleHideInfo}>close</button> */}
      </div>
      ) : null;
  
  };

  export default InfoDisplay;