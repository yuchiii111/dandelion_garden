export function Flowerfetch(jzgbh, callback) {
    fetch(`${process.env.REACT_APP_TEACHER_FLOWER}${jzgbh}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        callback(data); // 调用回调函数，没有错误，传入数据
      })
      .catch(error => {
        callback(null); // 调用回调函数，传入错误对象，数据为null
      });
  }
  