import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import Dropdown from '../Dropdown/Dropdown';
import './Save.css'
import '../Dropdown/Dropdown.css'
import { URL_HOST } from '../../urlHost';


const SavePgnToDatabase = ({ headers, pgn }) => {

  const [PGN, setPGN] = useState(pgn);
  const [saveLocation, setSaveLocation] = useState('');
  const [selectedValue, setSelectedValue] = useState({ value: '' });

  const options = [
    { value: "my_games", label: "My Games" },
    { value: "favorites", label: "Favorites" },
    { value: "assigned", label: "Assigned" }
  ];

  const postPGN = async () => {
    let pgn = { "pgn": PGN }
    try {
      const response = await axios.post(`${URL_HOST}/api/pgn/`, pgn, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}` } });
      const pgnId = response.data.id;
      await patchPGN(saveLocation, pgnId);
    } catch (error) {
      console.log(error.message)
    }
  };

  async function patchPGN(saveLocation, pgnId) {
    try {
      const response = await axios.patch(`${URL_HOST}/api/pgn/${saveLocation}/${pgnId}/`, {}, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}` } });
      console.log(response.data)
    } catch (error) {
      console.log(error.message)
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    postPGN();
  }


  useEffect(() => {
    setPGN(pgn)
  }, [pgn]);

  useEffect(() => {
    setSaveLocation(selectedValue.value);
  }, [selectedValue]);

  return (
    <div className='form-container'>
      <form className="save-form" spellCheck="false" onSubmit={handleSubmit}>
        <label className='save-label'>
          <textarea className="form-textarea" name="post" value={PGN}
            onChange={e => setPGN(e.target.value)}
            required={true} />
          <div className='save-div'>
            <h4 className='form-title'>Select Location ↓ </h4>
            <h4 className='save-title'>Save</h4>
            <button className='save-button' type='submit'>
              <HiArrowNarrowRight style={{ fontSize: "20px" }} />
            </button>

          </div>
        </label>
      </form>
      <div className="save-dropdown">
        <Dropdown placeHolder="Select..." options={options} selectedValue={selectedValue} setSelectedValue={setSelectedValue} />
      </div>
    </div>
  )
}
export default SavePgnToDatabase;
