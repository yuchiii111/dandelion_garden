// DropdownSelector.js
import React, { useState, useRef } from 'react';
import './styles.css';
import dimNbyCount from '../sys/dimNbyCount';
import dimEdge from '../sys/dimEdge';
import highlightEdge from '../sys/highlightEdge';
import highlightNbyAca from '../sys/highLNbyAca';

const FilterByCount = ({network, nodeGeo, edges, edgeGeo, scene}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasExecutedOptionSelect, setHasExecutedOptionSelect] = useState(false);
  const result = useRef(null);
  const options = [
    { value: 1, label: '0-50' },
    { value: 2, label: '51-100' },
    { value: 3, label: '101-150' },
    { value: 4, label: '151-200' },
    { value: 5, label: '201-250' },
    { value: 6, label: '251-300' },
    { value: 7, label: '301-350' },
    { value: 8, label: '351-400' },
    { value: 9, label: '401-450' },
    { value: 10, label: '451-500' },
    { value: 11, label: '501-550' },
    { value: 12, label: '551-600' },
    { value: 13, label: '601-650' },
    { value: 14, label: '651-700' },
    { value: 15, label: '701-750' },
    { value: 16, label: '751-800' },
    { value: 17, label: '801-850' },
    { value: 18, label: '851-900' },
    { value: 19, label: '901-950' },
    { value: 20, label: '951-1000' },
    { value: 21, label: '>1000' },
  ];
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option) => {
    if (selectedOption === option.value) {
        highlightEdge('project', edgeGeo);
        highlightEdge('award', edgeGeo);
        highlightEdge('publication', edgeGeo);
        highlightEdge('paper', edgeGeo);
        highlightEdge('None', edgeGeo);
        highlightEdge('patent', edgeGeo);
        if (result.current) {
          highlightNbyAca(nodeGeo, network, result.current.originalColors, result.current.line, scene);
        }
        setSelectedOption(null);
        setHasExecutedOptionSelect(false);
      } else {
        if (result.current) {
            highlightNbyAca(nodeGeo, network, result.current.originalColors, result.current.line, scene);
          }
        setSelectedOption(option.value);
        result.current = dimNbyCount(network, nodeGeo, edges, option.value);
        scene.add(result.current.line);
        if (!hasExecutedOptionSelect) {
            dimEdge('project', edgeGeo);
            dimEdge('award', edgeGeo);
            dimEdge('publication', edgeGeo);
            dimEdge('paper', edgeGeo);
            dimEdge('None', edgeGeo);
            dimEdge('patent', edgeGeo);        
            setHasExecutedOptionSelect(true);
        }
    }
        // onSelect(option); 
        // setIsOpen(false); 
  };

  return (
    <div className="dropdown-container">
      <button className='filterCount-button' onClick={toggleDropdown}>
        {/* {selectedOption ? selectedOption.label : '选择一个选项'} */}
        <img src="https://example.com/images/filter.png" alt="Filter" />
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div className="dropdown-option" key={option.value} onClick={() => handleSelect(option)}>
              {option.label}
              {option.value === selectedOption && <span className="checkmarkk">✔</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterByCount;
