import React, { useState, useEffect } from 'react';

const Picfetch = ({id}) => {
    const [pic, setPic] = useState('');

    useEffect(() => {
        let isMounted = true; 
        const fetchData = async () => {
            console.log(id);
            try {
                const response = await fetch(`${process.env.REACT_APP_PICTURE} `, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify({ 
                        "agentId": process.env.REACT_APP_AGENT_ID,
                        "agentSecret": process.env.REACT_APP_AGENT_SECRET,
                        "teacher_id": id
                    })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                if (isMounted) {
                    setPic(`data:image/png;base64,${data.base64}`);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Fetching error:', error);
                    setPic('');
                }
            }
        };

        fetchData();
    
        return () => {
            isMounted = false;
        };
    }, [id]);

    return (
        <div>
            {pic && <img src={pic} alt="Base64 Image" />}
        </div>
    )

}

export default Picfetch;