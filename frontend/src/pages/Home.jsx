import axios from 'axios'
import SongBarChart from "../components/SongBarChart.jsx";
import Tag from "../components/Tag.jsx";

import './home.css';


import { useState, useEffect, useRef } from 'react';

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const Home = () => {
    const [spinitronURL, setSpinitronURL] = useState("");
    const [loading, setLoading] = useState(false);
    const [spins, setSpins] = useState([]);
    const [tags, setTags] = useState([]);
    const [artist, setArtist] = useState(null);
    const [searchArtist, setSearchArtist] = useState(null);

    const [unfilteredSpins, setUnfilteredSpins] = useState([]); //without filters

    function getSpins() {
        setLoading(true);
        const regexp = new RegExp("https:\/\/spinitron.com\/.*\/dj\/.*\/.*");
        if(!spinitronURL.match(regexp)) {
            setLoading(false);
            alert("Invalid URL. Are you sure you are using a DJ url and not a playist url?");
            setSpinitronURL("");
        } else {
            axios.get(`/api/spins/${encodeURIComponent(spinitronURL)}`, {timeout: 100000}).then((response) => {
                console.log(response.data);
                setLoading(false);
                setUnfilteredSpins(response.data);
                setSpins(response.data);
                setTags([]);
            });
            // console.log(spinitronURL)
            // getSpins2(spinitronURL, false).then((response) => {
            //     console.log(response);
            // });

        }


    }
    


    function filterArtist(artist) {
        console.log(artist);
        // let newTags = [...tags, artist]
        // setTags(newTags);
        setArtist(artist);
        setSpins(unfilteredSpins.filter(spin => {
            return spin.artist.toLowerCase() == artist.toLowerCase();
        }));
    }

    function clearFilters() {
        // setTags([]);
        setArtist(null);
        setSpins(unfilteredSpins);
    }

    function handleSubmit(event) {
        event.preventDefault();
        filterArtist(searchArtist);
        setSearchArtist("");
    }

    // apiCall();
    return (
        <div className="container">

            <div>
                
                <form action={getSpins} className="form-group mb-3" >
                    <label for="spinitron-url" className="form-label">Paste your Spinitron DJ URL Here</label>
                    <div className="d-flex">
                        <input className="form-control m-1" placeholder="https://spinitron.com/.../dj/.../..."value={spinitronURL} name="spinitron-url" onChange={(e) => setSpinitronURL(e.target.value)}/>
                        <button className="btn btn-info m-1" type="submit">Enter</button>

                    </div>

                    
                    {loading ? 
                    <div>
                        <div className="spinner-border m-2" role="status">
                            <span className="sr-only"></span>
                            
                        </div>
                        <div>will take a minute, im not paying for better hosting sorry 🥀</div>
                    </div> : null

                    }
                </form>
                
                {unfilteredSpins.length != 0 && !loading ? 
                <>
                    <h2>Top Artists</h2>
                    <div className="m-2" >
                        
                        <SongBarChart data={unfilteredSpins} filterArtist={filterArtist}></SongBarChart>
                    </div>
                    <div  className="my-2" id="played-songs">
                        <h2 >Played Songs</h2>
                        <div className="d-flex align-items-center">
                            {/* <div id="filter-by-artist" className="m-1 fw-light fs-6 ">Filter by Artist: </div> */}
                            <form className="d-flex align-items-center" onSubmit={handleSubmit}>
                                <input className="form-control form-control-sm" type="text" placeholder="Filter by Artist" value={searchArtist} onChange={(e) => setSearchArtist(e.target.value)}></input>
                                <button className="btn btn-sm btn-info m-1" type="submit">Enter</button>
                            </form>
                            <div className="fw-light fs-6 ">or click artist name</div>
                            

                        </div>
                        
                        
                        {spins.length == 0 ? 
                            <div className="text-danger my-2">
                                No songs match filter
                            </div> : 
                            <div className="my-1 fw-light fs-6 ">Total songs: {spins.length}</div>
                            

                        }
                        <div className="d-flex align-items-center">
                            {artist == null ? null : <a onClick={clearFilters}><Tag  data={artist}></Tag></a>}
                        </div>

                        {spins.map(spin => (
                            <div className="row my-2">
                                <div className="col px-1 text-break">
                                    <a  onClick={() => filterArtist(spin.artist)} > <div className="p-1 fw-bold artistName">{spin.artist}</div></a>

                                </div>
                                <div className="col ">'{spin.song}'</div>
                                <div className="col text-break"><a target="_blank" href={'https://spinitron.com/' + spin.playlist} className="fw-light fs-6 ">{spin.timeslot}</a></div>
                                
                            </div>
                        ))}
                        <footer div className="py-5"></footer>
                        
                    </div>
                </> : null
                }  
            </div>

        </div>
    );
};

export default Home;