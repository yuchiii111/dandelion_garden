import React, { useState, useEffect } from 'react';

const Intro = () => {
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const instructions = [
    "Each sphere is a paper published in <i>Nature</i>.",
    // ... 其他指令信息
  ];

  // 模拟 jQuery 的 fadeIn 和 fadeOut 效果
  const showInstructions = () => {
    setInstructionsVisible(true);
  };

  const hideInstructions = () => {
    setInstructionsVisible(false);
  };

  useEffect(() => {
    // 组件挂载后执行的逻辑
    showInstructions();
    // 如果需要延迟执行，可以使用 setTimeout
    // setTimeout(hideInstructions, 5000); // 5秒后隐藏指令

    // 如果需要监听页面的点击事件，可以在这里添加事件监听器
    // window.addEventListener('mousedown', handleMouseDown);
    // return () => {
    //   window.removeEventListener('mousedown', handleMouseDown);
    // };
  }, []);

  const handleMouseDown = (e) => {
    // 处理鼠标点击逻辑
    // 例如，如果点击了特定的元素，可以隐藏指令
    if (e.target.id !== 'ui' && e.target.id !== 'lightBox') {
      hideInstructions();
    }
  };

  // 使用内联样式来控制显示和隐藏，实际开发中可能使用 CSS 类
  const style = {
    display: instructionsVisible ? 'block' : 'none',
    opacity: instructionsVisible ? 1 : 0,
    transition: 'opacity 0.5s',
  };

  return (
    <div id="lightBox" style={style}>
      {instructions.map((instruction, index) => (
        <p key={index}>{instruction}</p>
      ))}
      <ul className="intro-cocit">
        {/* 根据需要添加列表项 */}
      </ul>
      <a href="javascript:void(0)" id="ui" onClick={e => e.preventDefault()}>
        More controls
      </a>
    </div>
  );
};

export default Intro;