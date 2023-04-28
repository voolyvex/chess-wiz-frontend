import axios from 'axios';
import React, { useState, useEffect } from 'react';
import GameFeedMapper from '../GameFeed/GameFeedMapper';
import '../GameFeed/gamefeed.css'
import { URL_HOST } from '../../urlHost';

const Favorites = (props) => {
    

    const [games, setGames] = useState([])

    useEffect(() => {

        async function getAllFavorites() {
            // fetch games from django backend
            try {
                let response = await axios
                    .get(`${URL_HOST}/api/pgn/favorites/`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}` } });
                // const data = response.data.map((pgn) => {
                //         pgn.is_favorite = true;
                //         return pgn;
                //       });
                setGames(response.data);
                console.log(response)
            } catch (error) {
                console.log(error.message)
            }
        };

        getAllFavorites()
        
    }, []);

    return (
        <div id='game-feed'>
            <h3 className='feed-title-3'>
                Favorites
            </h3>
            <GameFeedMapper games={games} />
        </div>
    )
}

export default Favorites;