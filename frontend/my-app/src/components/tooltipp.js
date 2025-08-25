import Picfetch from '../app/pic';
import Tooltipfetch from '../app/loadtooltip'
import React, { useRef } from 'react';


const Toolltip = ( {hoveredObj, latestMouseProjection, instanceId} ) => {
  const ttdata = useRef({
    teacher: {
      teachership: '',
      discipline:  '',
      discipline1: '',
      discipline2: '',
      name_pinyin: '',
      techea_id: '',
      work_unit: '',
      graduate_school:'',
      degree:'',
    }
  });

  if (!hoveredObj || !instanceId || !latestMouseProjection.current) {
    return null;
  }
  // console.log(latestMouseProjection.current.x)
  // const name = hoveredObj.userData.tooltipText.name;
  Tooltipfetch(instanceId,(tooltipdata) => {
    // console.log(tooltipdata)
    ttdata.current = tooltipdata
    // const safeTooltipData = {
    //   ...tooltipdata,
    //   teacher: {
    //     ...tooltipdata.teacher,
    //     teachership: tooltipdata.teacher?.teachership || '',
    //     discipline: tooltipdata.teacher?.discipline || '',
    //     discipline1: tooltipdata.teacher?.discipline1 || '',
    //     discipline2: tooltipdata.teacher?.discipline2 || '',
    //   }
    // };
  });
  // console.log(ttdata.current)
  // console.dir(latestMouseProjection.current)
  const tooltipHeight = 250; // 假设 tooltip 高度为 100px
  const tooltipWidth = 350;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const tooltipRight = latestMouseProjection.current.x + tooltipWidth;
  const tooltipBottom = latestMouseProjection.current.y + tooltipHeight;
  let marginTop = `${latestMouseProjection.current.y + 10}px`;
  let marginLeft = `${latestMouseProjection.current.x + 10}px`;
  if (tooltipBottom > windowHeight) {
    marginTop = `${latestMouseProjection.current.y - tooltipHeight - 10}px`; // 调整 marginTop 使 tooltip 显示在上方
  } 
  if (tooltipRight > windowWidth) {
    marginLeft = `${latestMouseProjection.current.x - tooltipWidth - 20}px`; // 调整 marginTop 使 tooltip 显示在上方
  } 
  const tooltipStyle = {
    marginLeft: marginLeft,
    marginTop: marginTop,
    textAlign: 'center',
    paddingLeft: '15px',
    paddingTop:'0px',
    paddingBottom: '10px',
    backgroundColor: 'rgba(30, 32, 31, 0.8)',
    color: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '10px',
    width: '330px',
    fontSize: '14px',
  };
//  ttdata.current ? (
  
  return (
      <div className="tooltip-content" style={tooltipStyle}>
        {ttdata.current ? (
          <>
          <div className="tooltip-header">
            <p>
              <span className='tooltip-image'>
                <Picfetch id={instanceId}/>
              </span>
              &nbsp;&nbsp;&nbsp;
              <span style={{ backgroundColor: 'rgba(185, 247, 212)', borderRadius: '1px' , width: '7px'}}>
                &nbsp;
              </span>
              <span>
                &nbsp;&nbsp;{ttdata.current.teacher.name} {ttdata.current.teacher.name_pinyin}&nbsp;&nbsp;&nbsp;
              </span>
              <span style={{ backgroundColor: 'rgba(185, 247, 212)', color: 'rgba(30, 32, 31, 0.8)', borderRadius: '12px', padding: '5px', fontSize: '14px' }}>
                {ttdata.current.teacher.teachership}
              </span>
            </p>
          </div>
          <div className="tooltip-body" style={{ width: '330px', fontSize: '14px', textAlign: 'left' }}>
            <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>教师编号：</span>  {String(ttdata.current.teacher.techea_id).padStart(5, '0')}</p>
            <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>工作单位：</span> {ttdata.current.teacher.work_unit}</p>
            <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>学位：</span> {ttdata.current.teacher.degree}</p>
            <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>毕业院校:</span> {ttdata.current.teacher.graduate_school}</p>
            <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>学科：</span> {ttdata.current.teacher.discipline} | {ttdata.current.teacher.discipline1} | {ttdata.current.teacher.discipline2}</p>
          </div>
        </>
       ) : null}
       </div>
  )
};

export default Toolltip;
