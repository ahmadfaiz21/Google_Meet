const express = require("express");
const path = require("path");
const helmet = require('helmet');
const fs = require('fs');
const key = fs.readFileSync('key.pem');
const cert = fs.readFileSync('cert.pem');
const https = require('https');
const port = 7474;

const options = {
    key: key,
    cert: cert
};

var app = express(options);
// const server = https.createServer({key: key, cert: cert }, app);

// app.get('/',(req,res,next)=>{
//     res.status(200).send("olaaa");
// })

// server.listen(port,()=>{
//     console.log("ola");
// })
var server = app.listen(7474,function () {
  console.log("Listening on port 3000");
});

const io = require("socket.io")(server, {
    allowEIO3: true, // false by default aaa
  });
app.use(express.static(path.join(__dirname, "")));

var userConnections = [];
io.on("connection",(socket)=>{
    console.log("Socket id is ",socket.id)
    socket.on("userconnect",(data)=>{
        console.log("userconnect",data.displayName,data.meetingid);
        var other_users = userConnections.filter((p)=>p.meeting_id==data.meetingid); 

        userConnections.push({
            connectionId:socket.id,
            user_id:data.displayName,
            meeting_id:data.meetingid,
        });

        other_users.forEach((v)=>{
            socket.to(v.connectionId).emit("inform_others_about_me",{
                other_user_id:data.displayName,
                connId:socket.id,
            });
        });
        socket.emit("inform_me_about_other_user", other_users);
    });
    socket.on("SDPProcess",(data)=>{
        socket.to(data.to_connid).emit("SDPProcess",{
            message: data.message,
            from_connid: socket.id,
        })
    })
    
})