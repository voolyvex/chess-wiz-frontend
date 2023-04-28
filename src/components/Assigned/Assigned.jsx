import axios from 'axios';
import React, { useState, useEffect } from 'react';
import GameFeedMapper from '../GameFeed/GameFeedMapper';
import '../GameFeed/gamefeed.css'
import { URL_HOST } from '../../urlHost';

const Assigned = (props) => {

    const [games, setGames] = useState([])

    useEffect(() => {

        async function getAllAssigned() {
            // fetch games from django backend
            try {
                let response = await axios
                    .get(`${URL_HOST}/api/pgn/assigned/`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}` } });
                setGames(response.data);

            } catch (error) {
                console.log(error.message)
            }
        };

        getAllAssigned()
    }, []);

    return (
        <div id='game-feed'>
            <h3 className='feed-title-4'>
                Assigned
            </h3>
            <GameFeedMapper games={games} />

        </div>
    )
}

export default Assigned;