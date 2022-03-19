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

/* let n = {
    name: "Exemple",
    password: "12345",
    karma: 3,
    about: "assdf",
    showDead: true,
    noprocrast: true,
    maxvisit: 14,
    minaway: 2,
    delay: 100,
}

let result = await  postRequest("/newUser", n); */

let n = {
    _id: "623603fa00932e177e437571"
}
let result = await getRequest("/user", n);
console.log(result);