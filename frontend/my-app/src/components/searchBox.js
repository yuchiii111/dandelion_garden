import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import { UserOutlined, InfoCircleFilled } from '@ant-design/icons';
import { ConfigProvider, AutoComplete, Flex, Input, Space, Row, Col, message} from 'antd';
// import queryString from 'query-string';
import axios from 'axios';
import { animateCamera } from '../app/animateCamera';
import { mapNodeToScreen } from '../sys/mnts';
import * as THREE from 'three';
import createFlower from '../flower';
import { Flowerfetch } from '../app/loadflower';
import removeFlowerFromScene from '../sys/removeFlower';

const SearchBox = ({camera, control, node, detail, scene, isAnimating, nodeGeo, setIsAnimate}) => {
    const [options, setOptions] = useState([]);
    const [value, setValue] = useState('');
    const [data, setData] = useState([]);
    const handleSearch = (newValue) => {
      if (newValue) {
        axios.get(`${process.env.REACT_APP_SEARCH}${encodeURIComponent(newValue)}&page=1`)
        .then((response) => {
            const results = response.data.results.map(item => ({
              value: item.NAME,
              label: (
                <div>
                  <Row gutter={16}>
                    <Col >{item.NAME}</Col>
                    <Col >{String(item.JZGBH).padStart(5, '0')}</Col>
                    <Col >{item.work_unit}</Col>
                  </Row>
                </div>),
              ...item, 
            }));
            setData(results); 
            setOptions(results); 
          })
          .catch((error) => {
            console.error('Error fetching data: ', error);
          });
      } else {
        setOptions([]);
      }
      setValue(newValue);
    };
  
    const handleChange = (newValue) => {
      setValue(newValue);

    };
    const handleSelect = (newValue) => {
      message.config({
        top: 20,
        duration: 2,
        maxCount: 3,
        // rtl: true,
        prefixCls: 'my-message',
      });
      const indexToId1 = new Map();     

      node.forEach((node, index) => {
          if (!Number.isNaN(node.x) && !Number.isNaN(node.y)) {
            indexToId1.set(node.id, index);
          }
      });
      console.log(data);
      // console.log(newValue)
      const selectedTeacher = data.find(teacher => teacher.NAME === newValue);
      // console.log(selectedTeacher);
      if (selectedTeacher) {
        const selectedJzgbh = selectedTeacher.JZGBH;
        console.log(node);
        const targetTeacher = node.find(teacher => teacher.id === selectedJzgbh)
        console.log(targetTeacher)
        if (targetTeacher) {
          node.forEach(node => {
            const index = indexToId1.get(node.id);
            nodeGeo.setColorAt(index, nodeGeo.userData[index].originalColor);   
          })
          nodeGeo.instanceColor.needsUpdate = true;

          
          Flowerfetch(selectedJzgbh,(floweer_co) => {
            if(floweer_co){
            node.forEach(node => {
              if (node.flower) {
                scene.remove(node.flower);
                removeFlowerFromScene(node.flower);
                node.flower = null; 
              }
            });
            const petalCount = floweer_co.teacher.papers_count + floweer_co.teacher.patents_count + floweer_co.teacher.projects_count + floweer_co.teacher.awards_count + floweer_co.teacher.publications_count ;
            const targetz = petalCount * 45 / 143 + 20;
            const endTarget = mapNodeToScreen(targetTeacher);
            console.log(targetz)
            const targety = 250;
            endTarget.z = targetz*0.9 ;
            const endPosition = {
              ...endTarget, 
              y: endTarget.y - targetz*4 - 10, 
              z: endTarget.z + targetz*0.6 
            };
            
            
            isAnimating.current = true;
            setIsAnimate(true);
            animateCamera(camera, control, {x:0,y:0,z:window.innerHeight / Math.tan(28 * (Math.PI / 180) / 2)}, {x:0,y:0,z:0}, 3000,()=>{
              if(!targetTeacher.flower){

                node.isFetchingFlower = false;
                if (!floweer_co) {
                  return;
                }
                const mpt = mapNodeToScreen(targetTeacher);
                const nodePosition = new THREE.Vector3(mpt.x, mpt.y, mpt.z);
                const flower = createFlower({ position: nodePosition, node: targetTeacher, floweer_co: floweer_co });
                console.log(flower)
                targetTeacher.flower = flower;
                scene.add(flower);

              } else {
                targetTeacher.flower.visible = true;
              }
              detail();
              const originalColors = new Map();
              node.forEach(node => {
                const index = indexToId1.get(node.id);
                const originalColor = new THREE.Color();
                nodeGeo.getColorAt(index, originalColor);
                originalColors.set(index, originalColor.clone());
                if (node.id===selectedJzgbh) {
                } else {
                    const color = originalColors.get(index).clone();
                    nodeGeo.setColorAt(index, color.multiplyScalar(0.05));   
                }
              })
              nodeGeo.instanceColor.needsUpdate = true;
         
              // setTimeout(() => {
              //   isAnimating.current = false;
              // }, 200); 
            }, endPosition, endTarget, isAnimating); 
          } else {
            message.info({content:'暂时没有该教师的数据'});
          }
          })
          
        } else {
          message.info({content:'暂时没有该教师的数据'});
        };
      } else {
        message.info('暂时没有该教师的数据');
      }
    }
  
   return (
    <ConfigProvider
      theme={{
        token:{
          borderRadius:20,
          colorPrimary: '#2f302f',
          colorPrimaryBg: '#2f302f',
          colorBorder:'#2f302f',
          colorBgElevated:'#2f302f',
          // algorithm: true,
          colorBgContainer:'#2f302f',
          colorFillSecondary:'#2f302f',
          colorPrimaryHover:'#2f302f',
          colorText:'#ffffff',
        },
        components: {
          // autoComplete: {
          //   selectorBg:'#2f302f',
          //   colorPrimary:'#2f302f',
            // algorithm: true,
          // },
        },
      }}
    >
      <AutoComplete
          value={value}
          onSearch={handleSearch}
          onSelect={handleSelect}
          onChange={handleChange}
          // renderItem={renderOptionItem}
          popupClassName="certain-category-search-dropdown"
          popupMatchSelectWidth={300}
          style={{ width: '100%', height:'100%' }}
          options={options}
          size="large"
      >
          <Input.Search size="large" placeholder="Search for ..." enterButton />
      </AutoComplete>
    </ConfigProvider>
)
};

export default SearchBox;