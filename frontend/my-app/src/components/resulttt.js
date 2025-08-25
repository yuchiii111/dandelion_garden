import ReTooltipfetch from '../app/loadRetooltip';
import React, { useRef, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const ResultTooltip = ( {hoveredObj, latestMouseProjection, instanceId, instanceType} ) => {
  const rettdata = useRef({
    // teacher: {
    //   teachership: '',
    //   discipline:  '',
    //   discipline1: '',
    //   discipline2: '',
    //   name_pinyin: '',
    //   techea_id: '',
    //   work_unit: '',
    //   graduate_school:'',
    //   degree:'',
    // }
  });
  const [isHovering, setIsHovering] = useState(false);
  if (!hoveredObj || !instanceId || !latestMouseProjection.current || !instanceType) {
    return null;
  }
  // console.log(latestMouseProjection.current.x)
  ReTooltipfetch(instanceId,instanceType,(tooltipdata) => {
    // console.log(hoveredObj.userData.resultTooltip)
    console.log(tooltipdata)
    rettdata.current = tooltipdata
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
  // console.log(rettdata.current)
  // console.dir(latestMouseProjection.current)
  const tooltipHeight = 300; // 假设 tooltip 高度为 100px
  const tooltipWidth = 350;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const tooltipRight = latestMouseProjection.current.x + tooltipWidth;
  const tooltipBottom = latestMouseProjection.current.y + tooltipHeight;
  let marginTop = `${latestMouseProjection.current.y + 10}px`;
  let marginLeft = `${latestMouseProjection.current.x + 10}px`;
  if (tooltipBottom > windowHeight) {
    marginTop = `${latestMouseProjection.current.y - 320}px`; // 调整 marginTop 使 tooltip 显示在上方
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
  const displayJsonData = () => {
    if (!rettdata.current || Object.keys(rettdata.current).length === 0) {
      return null;
    }
    const friendlyNames = {
      'by01': '分类1',
      'by02': '分类2',
      'by03': '分类3',
      'CITEDTIMES': '被引次数',
      'is_vertical_project': '是否垂直项目',
      'project_ESTABLISH_date': '设立时间',
      'project_name': '项目名称',
      'project_id': '项目编号',
      'DISCIPLINE': '学科分类',
      'ESI':'ESI',
      'IMPACTFACTOR':'影响因子',
      'YEAR':'年份',
      'TITLE':'标题',
      'keywords':'关键词',
      'PAPER_CLASS': '论文分类',
      'PRINTDATE': '印刷时间',
      'MEDIA':'出版社',
      'LANGUAGE': '语言',
      'ISSN':'ISSN',
      'Book_Name':'书名',
      'Category':'分类',
      'Publish_Date':'发表时间',
      'Publisher_Name':'出版社',
      'Patents_NAME':'专利名称',
      'IS_INTERNATIONAL_PATENT':'是否国际专利'
  };
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Object.entries(rettdata.current).map(([key, value]) => {
          if (key === 'LINK1' || key === 'LINK2') {
            return null; // 忽略 LINK1 和 LINK2
          }
          const displayName = friendlyNames[key];
          if (!displayName) {
            return null; 
          }
          return (
            <div
              key={key}
              style={{
                marginBottom: '5px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  fontWeight: 'bold',
                  minWidth: '90px', // 固定最小宽度
                  maxWidth: '90px', // 固定最大宽度
                  flexShrink: 0, // 防止键部分被压缩
                  textAlign: 'right', // 键右对齐
                  whiteSpace: 'nowrap', // 确保文本不会换行
                  marginRight: '10px' // 可以根据需要调整间距
                }}
              >
                {displayName}:
              </span>
              <span
                style={{
                  flexGrow: 1, // 使值部分占据剩余空间
                  textAlign: 'left', // 值居中对齐
                  whiteSpace: 'nowrap', // 确保值不会换行
                  overflow: 'hidden', // 如果值太长，则隐藏多余的部分
                  textOverflow: 'ellipsis' // 如果值太长，则使用省略号表示
                }}
              >
                {value}
              </span>
            </div>
          );
        }).filter(Boolean)} {/* 过滤掉所有 null 值 */}
      </div>
    );
  };
  const handleExternalLinkClick = (url) => {
    window.open(url, '_blank');
  };
  const buttonStyle = {
    background: 'none',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // 绝对定位
    top: '5px', // 距离顶部 10px
    right: '5px', // 距离右边 10px
  };

  const arrowIconStyle = {
    color: 'white', // 将箭头图标设置为白色
    fontSize: '15px', // 调整图标大小
  };

//  ttdata.current ? (
  return (
      <div 
        className="re-tooltip-content" 
        style={tooltipStyle}  
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          style={{
            pointerEvents: isHovering ? 'auto' : 'none', // 当 hover 时允许内部元素触发事件
            position: 'relative',
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {rettdata.current && rettdata.current.LINK1 ? (
            <button
              className="close-button"
              style={buttonStyle}
              onClick={() => handleExternalLinkClick(rettdata.current.LINK1)}
            >
              <LeftOutlined style={arrowIconStyle} />
              <RightOutlined style={arrowIconStyle} />
            </button>
        ) : null}
          {displayJsonData()}
        </div>
      </div>
      // ) : null;
  )
};

export default ResultTooltip;
