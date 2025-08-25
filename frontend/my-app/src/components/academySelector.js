import React, { useState, useRef } from 'react';
import './index.css';
import dimNbyAca from '../sys/dimNbyAca';
import dimEdge from '../sys/dimEdge';
import highlightEdge from '../sys/highlightEdge';
import highlightNbyAca from '../sys/highLNbyAca';

const AcademySelector = ({network, nodeGeo, edges, edgeGeo, scene}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [filter, setFilter] = useState('');
  // const [result, setResult] = useState(null);
  const result = useRef(null);
  const [hasExecutedOptionSelect, setHasExecutedOptionSelect] = useState(false);
  // let result;
  const toggleOptions = () => {
   
  };

  const selectOption = (option) => {
    if (selectedValue === option.value) {
      highlightEdge('project', edgeGeo);
      highlightEdge('award', edgeGeo);
      highlightEdge('publication', edgeGeo);
      highlightEdge('paper', edgeGeo);
      highlightEdge('None', edgeGeo);
      highlightEdge('patent', edgeGeo);
      if (result.current) {
        highlightNbyAca(nodeGeo, network, result.current.originalColors, result.current.line, scene);
      }
      setSelectedValue(null);
      setHasExecutedOptionSelect(false);
    } else {
      if (!hasExecutedOptionSelect) {
        dimEdge('project', edgeGeo);
        dimEdge('award', edgeGeo);
        dimEdge('publication', edgeGeo);
        dimEdge('paper', edgeGeo);
        dimEdge('None', edgeGeo);
        dimEdge('patent', edgeGeo);        
        setHasExecutedOptionSelect(true);
      }
      // console.log(option.label)
      if (result.current) {
        highlightNbyAca(nodeGeo, network, result.current.originalColors, result.current.line, scene);
      }
      result.current = dimNbyAca(network, nodeGeo, edges, option.label);
      // console.log(line)
      scene.add(result.current.line);
      setSelectedValue(option.value);
    }
  };
  const options = [
    { label: '材料科学与工程学院', value: 'materials_science_and_engineering' },
    { label: '测绘与地理信息学院', value: 'surveying_and_geographic_information' },
    { label: '电子与信息工程学院', value: 'electronics_and_information_engineering' },
    { label: '法学院', value: 'law' },
    { label: '国际足球学院', value: 'international_football' },
    { label: '海洋与地球科学学院', value: 'oceanography_and_earth_science' },
    { label: '航空航天与力学学院', value: 'aerospace_and_mechanics' },
    { label: '化学科学与工程学院', value: 'chemical_science_and_engineering' },
    { label: '环境科学与工程学院', value: 'environmental_science_and_engineering' },
    { label: '机械与能源工程学院', value: 'mechanical_and_energy_engineering' },
    { label: '建筑与城市规划学院', value: 'architecture_and_urban_planning' },
    { label: '交通运输工程学院', value: 'transportation_engineering' },
    { label: '经济与管理学院', value: 'economics_and_management' },
    { label: '口腔医学院', value: 'stomatology' },
    { label: '马克思主义学院', value: 'marxism' },
    { label: '汽车学院', value: 'automotive' },
    { label: '人文学院', value: 'humanities' },
    { label: '软件学院', value: 'software' },
    { label: '设计创意学院', value: 'design_and_creative' },
    { label: '生命科学与技术学院', value: 'life_science_and_technology' },
    { label: '数学科学学院', value: 'mathematical_science' },
    { label: '铁道与城市轨道交通研究院', value: 'railway_and_urban_traffic' },
    { label: '土木工程学院', value: 'civil_engineering' },
    { label: '外国语学院', value: 'foreign_languages' },
    { label: '物理科学与工程学院', value: 'physics_and_engineering' },
    { label: '艺术与传媒学院', value: 'art_and_media' },
    { label: '医学院', value: 'medical' },
    { label: '政治与国际关系学院', value: 'international_relations' },
    { label: '中德工程学院', value: 'sino-german_engineering' },
    { label: '中德学院', value: 'sino-german' },
  ];
  return (
    <div className="custom-select" onClick={toggleOptions}>
      <div className="options-wrapper">
        <div className="options">
          {options.map((option) => (
            <div
              key={option.value}
              className="option"
            //   className={`option ${option.value === value ? 'selected' : ''}`}
              onClick={() => selectOption(option)}
            >
              {option.label}
              {option.value === selectedValue && <span className="checkmark">✔</span>}
            </div>
          ))}
        </div>
        </div>
      {/* )} */}
    </div>
  );
};

export default AcademySelector;