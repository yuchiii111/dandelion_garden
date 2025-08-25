export default function Tooltipfetch(jzgbh, callback) {
    fetch(`${process.env.REACT_APP_TEACHER_POINT}${jzgbh}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        callback(data);
      })
      .catch(error => {
        callback(null); 
      });
  }
  