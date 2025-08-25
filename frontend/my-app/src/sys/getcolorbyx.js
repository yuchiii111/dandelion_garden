export const getColorByGenre = (type) => {
    var groups ={
        "papers": 0xcdfbe8, //0xb5f8d5,//cccccc,
        "programs":0xc7f3fa, //4b3ce0,
        "patents":0x5c6cf6,//0x00a7f0,
        "awards":0xfcfbca,//e54400,
        "publications":0xf3cbfb, //b20061,
      };
      
    return groups[type] || 0xb7eac3;
  }