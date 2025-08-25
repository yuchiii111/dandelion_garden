
import React from 'react';
import './index.css';
import { Checkbox, Col, Row } from 'antd';
import { getColorByG } from '../sys/getcolorbyy';
import dimEdge from '../sys/dimEdge';
import highlightEdge from '../sys/highlightEdge';
import highlightFlower from '../sys/highlightF';
import dimFlower from '../sys/dimF';
      // const onChange = (newValue) => {
      //   setValue(newValue);
      //   // console.log(newValue)
      //   treeData.forEach((obj) => {
      //     if(obj.value === newValue) {
      //       highlightEdge(obj.title, edge);
      //     } else {
      //       dimEdge(obj.title, edge);
      //     }
      //   })}
  const onChange = (checkedValues) => {
    console.log('checked = ', checkedValues);
  };
  
  
    const options = [
      {
      value: '论文',
      title: 'papers',
      },
      {
      value: '项目',
      title: 'programs',
      },
      {
      value: '专利',
      title: 'patents',
      },
      {
      value: '科研获奖',
      title: 'awards',
      },
      {
      value: '科研著作',
      title: 'publications',
      },
  ];
  
  const defaultChecked = options.map((option) => option.value);
  const Filter_o = ({edge}) => {
      const handleChange1 = (e) => {
          const checked = e.target.checked;
          if (checked) {
            highlightEdge('paper', edge.current);
          } else {
            dimEdge('paper', edge.current);
          }
      };
      const handleChange3 = (e) => {
          const checked = e.target.checked;
          if (checked) {
            highlightEdge('patent', edge.current);
          } else {
            dimEdge('patent', edge.current);
          }
      };
      const handleChange4 = (e) => {
          const checked = e.target.checked;
          if (checked) {
            highlightEdge('award', edge.current);
          } else {
            dimEdge('award', edge.current);
          }
      };
      const handleChange5 = (e) => {
          const checked = e.target.checked;
          if (checked) {
            highlightEdge('publication', edge.current);
          } else {
            dimEdge('publication', edge.current);
          }
      };
      const handleChange2 = (e) => {
          const checked = e.target.checked;
          if (checked) {
            highlightEdge('project', edge.current);
          } else {
            dimEdge('project', edge.current);
          }
      };
      
    return (
      <div style={{ width: '32.3vh', backgroundColor:'rgba(30, 30, 30, 0.8)', height:'7.5vh', borderRadius:'15px'}}>
          {/* <Checkbox.Group optionRender={optionRender} labelRender={labelRender} options={options} defaultValue={['论文']} onChange={onChange} /> */}
          <Checkbox.Group style={{ padding:'10px'}} onChange={onChange} defaultValue={defaultChecked}>
          <Row gutter={[8,8]} >
          <Col span={8} style={{width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
              <Checkbox onChange={handleChange1} value="论文" style={{display:'flex',flexDirection: 'row-reverse'}}>     
                  <div
                      style={{
                          borderColor:'#cdfbe8', borderStyle:'solid', borderWidth:'1px', borderRadius:'15px', textAlign:'center', color:'white', fontSize:'1.4vh', padding:'0px 10px'
                      }}
                  >
                      论文
                  </div>
              </Checkbox>
          </Col>
          <Col span={8} style={{width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
              <Checkbox onChange={handleChange2} value="项目" style={{display:'flex',flexDirection: 'row-reverse'}}>
                  <div
                      style={{
                          borderColor:'#c7f3fa', borderStyle:'solid', borderWidth:'1px', borderRadius:'15px', textAlign:'center', color:'white', fontSize:'1.4vh', padding:'0px 10px'
                      }}
                  >
                      项目
                  </div>
              </Checkbox>
          </Col>
          <Col span={8} style={{width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
              <Checkbox onChange={handleChange3} value="专利" style={{display:'flex',flexDirection: 'row-reverse'}}>
                  <div
                      style={{
                          borderColor:'#5c6cf6', borderStyle:'solid', borderWidth:'1px', borderRadius:'15px', textAlign:'center', color:'white', fontSize:'1.4vh', padding:'0px 10px'
                      }}
                  >
                      专利
                  </div>
              </Checkbox>
          </Col>
          <Col span={11} style={{width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
              <Checkbox onChange={handleChange4} value="科研获奖" style={{display:'flex',flexDirection: 'row-reverse'}}>
                  <div
                      style={{
                          borderColor:'#fcfbca', borderStyle:'solid', borderWidth:'1px', borderRadius:'15px', textAlign:'center', color:'white', fontSize:'1.4vh', padding:'0px 10px'
                      }}
                  >
                      科研获奖
                  </div>
              </Checkbox>
          </Col>
          <Col span={11} style={{width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
              <Checkbox onChange={handleChange5} value="科研著作" style={{display:'flex',flexDirection: 'row-reverse'}}>
                  <div
                      style={{
                          borderColor:'#f3cbfb', borderStyle:'solid', borderWidth:'1px', borderRadius:'15px', textAlign:'center', color:'white', fontSize:'1.4vh', padding:'0px 10px'
                      }}
                  >
                      科研著作
                  </div>
              </Checkbox>
          </Col>
          </Row>
      </Checkbox.Group>
      </div>
    )
  };
  
  export default Filter_o;