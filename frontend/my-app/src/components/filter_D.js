import React, { useEffect, useState, useRef } from 'react';
import './index.css';
import { Checkbox, Col, Row } from 'antd';
import { getColorByG } from '../sys/getcolorbyy';
import highlightFlower from '../sys/highlightF';
import dimFlower from '../sys/dimF';
import { clearGeoState } from '../sys/dimFbyYear';

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
    title: 'projects',
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

// const defaultChecked = options.map((option) => option.value);
const Filter_d = ({network, scene, cameras, viewState, triggerEffect}) => {
    const effectTriggered = useRef(false);
    const [checkedValues, setCheckedValues] = useState(() => {
        console.log(JSON.parse(localStorage.getItem('filterCheckedValues')));
        return JSON.parse(localStorage.getItem('filterCheckedValues')) || ['论文'];
      });
    useEffect(() => {
        localStorage.setItem('filterCheckedValues', JSON.stringify(checkedValues));

    }, [checkedValues]);
    // const isViewStateChanged = useIsChanged(viewState);
    useEffect(() => {
        if (!effectTriggered.current) {
          effectTriggered.current = true;
    
          // 设置 triggerEffect 回调函数
          triggerEffect.current = () => {
            // console.log(1);
            // console.log(viewState);
            if (viewState) {
              console.log(2);
              clearGeoState(scene);
              options.forEach(option => {
                if (checkedValues.includes(option.value)) {
                  // highlightFlower(option.title, network);
                } else {
                  dimFlower(option.title, network);
                }
              });
            }
          };
        }
    
        if (viewState) {
          triggerEffect.current();
        }
    
        // 清理函数
        return () => {
          effectTriggered.current = false;
        };
      }, [viewState]);
    // useEffect(() => {
    //     console.log(1);
    //     console.log(viewState)
    //     if (viewState) {
    //       console.log(2);
    //       clearGeoState(scene);
    //       options.forEach(option => {
    //         if (checkedValues.includes(option.value)) {
    //         //   highlightFlower(option.title, network);
    //         } else {
    //           dimFlower(option.title, network);
    //         }
    //       });
    //     }
    // }, [viewState]);
    const handleChange = (value, value1, checked) => {
        clearGeoState(scene);
        if (checked) {
          highlightFlower(value, network);
          setCheckedValues(prev => [...prev, value1]);
        } else {
          dimFlower(value, network);
          setCheckedValues(prev => prev.filter(item => item !== value1));
        }
      };
      const renderCheckbox = (option) => {
        const spanValue = option.value === '科研著作' || option.value === '科研获奖' ? 11 : 8;
        return(
        <Col span={spanValue} key={option.value} style={{width:'100%', display:'flex',}}>
          <Checkbox
            onChange={(e) => handleChange(option.title, option.value, e.target.checked)}
            value={option.value}
            checked={checkedValues.includes(option.title)}
            style={{ display: 'flex', flexDirection: 'row-reverse' }}
          >
            <div
              style={{
                borderColor: getColorByG(option.value), 
                borderStyle: 'solid',
                borderWidth: '1px',
                borderRadius: '15px',
                textAlign: 'center',
                color: 'white',
                fontSize: '1.4vh',
                padding: '0px 10px'
              }}
            >
              {option.value}
            </div>
          </Checkbox>
        </Col>
      )};
    
  return (
    <div style={{ width: '32.3vh', backgroundColor:'rgba(30, 30, 30, 0.8)', height:'7.5vh', borderRadius:'15px'}}>
          {/* <Checkbox.Group optionRender={optionRender} labelRender={labelRender} options={options} defaultValue={['论文']} onChange={onChange} /> */}
          <Checkbox.Group style={{ padding:'10px'}} onChange={onChange} defaultValue={checkedValues}>
          <Row gutter={[8,8]} >
            {options.map(renderCheckbox)}
          </Row>
      </Checkbox.Group>
      </div>
  )
};

export default Filter_d;