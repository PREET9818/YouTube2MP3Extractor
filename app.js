//required packages
const express = require("express");
const fetch = require("node-fetch");
const { spawn } = require('child_process');
require("dotenv").config();

//create the express server
const app = express();

//server port number
const PORT = process.env.PORT || 3000;

//set template engine
app.set("view engine", "ejs");
app.use(express.static("public"));

//needed to parse html data for POST request
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/convert-mp3", async (req, res) => {
    const videoId = req.body.videoID;
    if(
       videoId  === undefined ||
       videoId === "" ||
       videoId === null
    ){
        return res.render("index",{success : false, message : "Please enter a video ID"});
    }else{
        const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,{
            "method" : "GET",
        "headers" :{
            "x-rapidapi-key" : process.env.API_KEY,
            "x-rapidapi-host" : process.env.API_HOST
        }  
    });
    

    const fetchResponse = await fetchAPI.json();

    if(fetchResponse.status === "ok")
    return res.render("index",{success : true, song_title: fetchResponse.title, song_link : fetchResponse.link});
    else
    return res.render("index",{success: false, message : fetchResponse.msg})
    } 
})

app.post("/convert-mp3-url", async (req, res) => {
    const videoUrl = req.body.videoURL;

    const python = spawn('python', ['./download.py', videoUrl]);  // Call the Python script with the full URL

    python.on('close', (code) => {
        if (code !== 0) {
            return res.render("index", { success: false, message: "Error processing your request"});
        } else {
            return res.render("index", { success: true, song_title: 'Download Complete', song_link: 'asdf/audiooutputfile.mp3'});
        }
    });
});



//start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})


