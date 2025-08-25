export const getColorByType = (type) => {
    var groups ={
        "艺术学":0xe0c6f9,//f6d4d2,//cccccc,
        "文学":0xf0d7a8,//ced6fa, //4b3ce0,
        "医学":0x828ae6,//fcdbe2,//0x00a7f0,
        "历史学":0xd3fee2,//e54400,
        "理学":0x86cbeb,//0xd0f1fb, //b20061,
        "法学":0x545acb,//ccd1f9,//c3ff33,
        "工学":0xd6fbe8,//ffcf0a,//0x9ad1ff,//0x0002cc,
        "经济学":0xd7ccef,//fbfbcd,//85b44d,
        "管理学":0xe9b65c,//fbebc9,//d19657,
        "哲学":0x9f40d8,//eec9fa,//938ee0,//0x8782d2,
        "教育学":0xd57b87,//fad6de,//00bd7e,
        // "NaN":0xb7eac3,
        // "Psych":0x00d3d9,
        // "Social sciences":0xca65ca
      };
      
    return groups[type] || 0xb7eac3;
  }