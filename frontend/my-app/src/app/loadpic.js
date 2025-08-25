export default function Picfetchh(id, callback) {
    fetch(`${process.env.REACT_APP_PICTURE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "agentId": process.env.REACT_APP_AGENT_ID,
        "agentSecret": process.env.REACT_APP_AGENT_SECRET,
        "teacher_id": id
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      callback(`data:image/png;base64,${data.base64}`);
    })
    .catch(error => {
      console.error('Fetching error:', error);
      fetch(`${process.env.REACT_APP_PICTURE_MODEL}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Model image response was not ok');
          }
          return response.blob();
        })
        .then(modelImage => {
          const objectURL = URL.createObjectURL(modelImage);
          callback(objectURL);
        })
        .catch(secondError => {
          console.error('Error fetching model image:', secondError);
          callback(null); 
        });
    });
  }