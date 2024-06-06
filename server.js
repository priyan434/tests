const express = require("express");

function createserver(){
    const app=express()
    app.use(express.json())
    return app

}
export default createserver