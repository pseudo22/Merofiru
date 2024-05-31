import dotenv from "dotenv";

//env config

dotenv.config({
    path : './.env'
})


//app start

import {app} from './app.js';
const PORT = process.env.PORT || 3000;
app.get('/' , (req,res) => {
  res.send('hello')
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






