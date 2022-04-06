const axios = require("axios");

async function postRequest (url, params) {
    let res = {};
    await axios({
        method: 'post',
        url: "http://localhost:2000/v1" + url,
        data: {
            params
        }
      })
      .then(response => {
          res = response.data;
      })
      .catch(err => {
          res = err;
      })
    return res;
}

async function getRequest (url, query) {
    let res = {};
    await axios({
        method: 'get',
        url: "http://localhost:2000/v1" + url,
        params: query
      })
      .then(response => {
          res = response.data;
      })
      .catch(err => {
          res = err;
      })
    return res;
}


//Creates a task (n) or a url (m)
/* 
let n = {
    title: "Esto es un título de un ask - 7",
    points: 49,
    text: "Fino señores"
}

let m = {
    title: "Esto es un título de un url - 7",
    points: 0,
    url: "http://google.es"
}

let result = await  postRequest("/newSubmission", m); 
 */

//Search for type (t) => url || ask, can be ordered by property "pts" => desc
/* 
let n = {
    p: "1",
    t: "any",
    o: "pts"
}

let result = await  getRequest("/submission_page", n);
 */

/* let n = {
    _id: "623603fa00932e177e437571"
}
let result = await getRequest("/user", n); */

console.log(result);
