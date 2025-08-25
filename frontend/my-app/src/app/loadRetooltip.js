export default function ReTooltipfetch(id,type, callback) {
    fetch(`${process.env.REACT_APP_DETAIL}id=${id}&type=${type}`)
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
  