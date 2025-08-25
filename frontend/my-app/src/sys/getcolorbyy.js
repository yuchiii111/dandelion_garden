export const getColorByG = (type) => {
    var groups ={
        "论文": '#cdfbe8', //0xb5f8d5,//cccccc,
        "项目":'#c7f3fa', //4b3ce0,
        "专利":'#5c6cf6',//0x00a7f0,
        "科研获奖":'#fcfbca',//e54400,
        "科研著作":'#f3cbfb', //b20061,
      };
      
    return groups[type] || '#00d3d9';
  }