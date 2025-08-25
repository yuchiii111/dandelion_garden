export default function Modelpicfetch( id, scale, callback = () => {}) {
    if (id < 6) {
        fetch(`${process.env.REACT_APP_PICTURE_DEFAULT}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(data => {
                if (typeof callback === 'function') {
                    callback(data, scale);
                }
            })
            .catch(error => {
                console.error('Fetching error:', error);
                if (typeof callback === 'function') {
                    callback(null, scale);
                }
            });
    }
}
