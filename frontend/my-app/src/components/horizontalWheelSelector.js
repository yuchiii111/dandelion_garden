import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
// import dimFlowerbyYear from "../sys/dimFbyYear";
import highlightFbyYear from "../sys/highlightFbyYear";
import { updateFlowersByYear, clearState } from "../sys/dimFbyYear";

const TimeSelector = ({ network, containerWidth = 320, itemWidth = 64, scene}) => {
  const yearItemsContRef = useRef();
  const customScrollbarRef = useRef(null);
  const isScrolling = useRef(false);
  const yearRefs = useRef([]);

  // 生成1980-2025的年份列表
  const yearItems = useMemo(() => {
    const items = [];
    for (let year = 1980; year <= 2025; year++) {
      items.push({ value: year, label: `${year}` });
    }
    return items;
  }, []);

  const [yearValue, setYearValue] = useState('2024'); // 默认选择2024年

  const yearItemsMap = useMemo(
    () =>
      yearItems.reduce(
        (map, item, index) => map.set(item.value, index),
        new Map()
      ),
    [yearItems]
  );

  const currentYearValue = useRef(yearItemsMap?.get(yearValue) ?? 5);

  const visibleItemsCount = 7;
  const offset = 3;
  const maxScrollOffset = (containerWidth - itemWidth) / 2;

  function rerenderYearElements(
    selectedElement,
    scrollLeft,
    firstItemIndex = Math.max(selectedElement - offset, 0),
    lastItemIndex = Math.min(selectedElement + offset, yearItems.length)
  ) {
    if (yearRefs.current) {
      yearRefs.current
        .slice(firstItemIndex, lastItemIndex)
        .forEach((item, index) => {
          const realIndex = index + firstItemIndex;
          // const scrollOffset = Math.min(
          //   Math.abs(scrollLeft - realIndex * itemWidth - itemWidth / 2),
          //   maxScrollOffset
          // );
          // const sin = scrollOffset / maxScrollOffset;
          const relativeOffset = realIndex - selectedElement; // 相对于选中元素的偏移量
          const maxRelativeOffset = Math.floor(visibleItemsCount / 2); // 最大相对偏移量
          
          let sin;
          let scale;
          let opacity;
          if (relativeOffset === 0) {
            // 选中的年份项目
            sin = 0;
            scale = 1.2;
            opacity = 1;
          } else if (Math.abs(relativeOffset) === 1) {
            // 选中的前一个或后一个年份项目
            sin = 0.25;
            scale = 0.75;
            opacity = 0.75;
          } else if (Math.abs(relativeOffset) === 2) {
            // 选中的前两个或后两个年份项目
            sin = 0.5;
            scale = 0.4;
            opacity = 0.5;
          } else {
            // 其他年份项目
            sin = 1;
          }
          // 计算滚动偏移量，确保选中的元素偏移量为0，前后逐渐增加
          // const scrollOffset = Math.abs(relativeOffset) * itemWidth;
  
          // // 确保不超过最大滚动偏移量
          // const clampedScrollOffset = Math.min(scrollOffset, maxScrollOffset);
  
          // const sin = clampedScrollOffset / maxScrollOffset;
          const cos = Math.sqrt(1 - sin ** 2);
          if (!item) return;
          const [div] = item.getElementsByTagName("div");
          // const scale = realIndex === selectedElement ? 1 : 0.5;
          // const opacity = realIndex === selectedElement ? 1 : 0.5;
          div.style.transform = `rotateY(${Math.asin(sin)}rad) scale(${scale})`;
          div.style.opacity = opacity;
          div.style.transformOrigin = "center";
          
        });
    }
  }

  useEffect(() => {
    let isAnimating = false;

    function handleYearScroll(event) {
      if (!isAnimating) {
        isAnimating = true;

        requestAnimationFrame(() => {
          const scrollLeft = Math.max(event.target.scrollLeft, 0);
          const selectedElement = Math.min(
            Math.max(Math.floor(scrollLeft / itemWidth) + 2, 0),
            yearItems.length - 1
          );
          window.clearTimeout(isScrolling.current);
          rerenderYearElements(selectedElement, scrollLeft);

          currentYearValue.current = selectedElement;
          isScrolling.current = setTimeout(function () {
            // highlightFbyYear(yearItems[selectedElement].value, network);
            // dimFlowerbyYear(yearItems[selectedElement].value, network);
            clearState(network, scene); // 清理状态
            updateFlowersByYear(yearItems[selectedElement].value, network, scene); // 更新状态
            // highlightFbyYear(yearItems[selectedElement].value, network);
            console.log("Selected Year", yearItems[selectedElement].value);
            setYearValue(yearItems[selectedElement].value); // 更新状态
          }, 0);

          isAnimating = false;
        });
      }
    }

    yearItemsContRef.current?.addEventListener("scroll", handleYearScroll);

    // yearRefs.current[currentYearValue.current]?.scrollIntoView({
    //   inline: "center",
    //   behavior: "smooth",
    // });
    const selectedIndex = yearItemsMap.get(yearValue);
    if (selectedIndex !== undefined && yearRefs.current[selectedIndex]) {
      yearRefs.current[selectedIndex]?.scrollIntoView({
        inline: "center",
        behavior: "smooth",
      });
    }
    rerenderYearElements(
      currentYearValue.current,
      yearItemsContRef.current?.scrollLeft,
      0,
      yearItems.length
    );

    return () => {
      yearItemsContRef.current?.removeEventListener("scroll", handleYearScroll);
    };
  }, [yearItems, yearItemsContRef.current]);

  useEffect(() => {
    // const index = yearItemsMap.get(yearValue);
    // if (index !== currentYearValue.current) {
    //   currentYearValue.current = index;
    //   yearRefs.current[index]?.scrollIntoView({
    const selectedIndex = yearItemsMap.get(yearValue);
    if (selectedIndex !== currentYearValue.current) {
      currentYearValue.current = selectedIndex;
      if (yearRefs.current[selectedIndex]) {
        yearRefs.current[selectedIndex]?.scrollIntoView({
          inline: "center",
          behavior: "smooth",
        });
      }
      rerenderYearElements(
        currentYearValue.current,
        yearItemsContRef.current?.scrollLeft,
        0,
        yearItems.length
      );
    }
  }, [yearValue, yearItems, yearItemsContRef.current]);

  return (
    <div
      className="container"
      style={{
        width: `${containerWidth}px`,
      }}
    >
      <ul className="items" ref={yearItemsContRef}>
        {yearItems.map((item, index) => (
          <li
            className="item"
            key={item.value}
            ref={(node) => (yearRefs.current[index] = node)}
            style={{
              width: `${itemWidth}px`,
              lineHeight: `${itemWidth}px`,
            }}
          >
            <div>{item.label}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimeSelector;
// export default HorizontalScrollSelector;
