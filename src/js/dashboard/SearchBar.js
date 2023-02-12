import React, { useState } from "react";

import '../../css/SearchBar.css';

export default function SearchBar({ placeholder, data }) {
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState("");

  const handleFilter = (event) => {
    const searchWord = event.target.value;
    setWordEntered(searchWord);
    const newFilter = data.filter((value) => {
      return value.name.toLowerCase().includes(searchWord.toLowerCase());
    });

    if (searchWord === "") {
      setFilteredData([]);
    } else {
      setFilteredData(newFilter);
    }
  };

  const clearInput = () => {
    setFilteredData([]);
    setWordEntered("");
  };

  return (
    <div className="col-4">
      <div className="search" style={{"width":"100%"}}>
        <div className="searchInputs">
            <input className="searchInput"
            type="text"
            placeholder={placeholder}
            value={wordEntered}
            onChange={handleFilter}
            />
            <div className="searchIcon">
            {filteredData.length === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
            ) : (
                <svg onClick={()=>clearInput()} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
            )}
            </div>
        </div>
        {filteredData.length != 0 && (
          <div className="dataResult">
            {filteredData.map((value, key) => {
              return (
                <a className="dataItem" href={"/app/ticket/"+value.id}>
                    <p className="name">{value.name}</p>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}