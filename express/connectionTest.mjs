import axios from "axios";

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

let n = {
    title: "Esto es un título de un ask",
    points: 2,
    text: "Fino señores"
}

let result = await  postRequest("/newSubmission", n);

/* let n = {
    _id: "623603fa00932e177e437571"
}
let result = await getRequest("/user", n); */
console.log(result);