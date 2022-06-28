const cheerio = require('cheerio')
const axios = require('axios')
const qs = require('qs')
const fetch = require("node-fetch");
const cookie = require("cookie");
const FormData = require("form-data");
const exec = require('child_process').exec;
const os = require("os");
const author = "KiZakiXD"

async function post(url, formdata = {}, cookies) {
let encode = encodeURIComponent;
let body = Object.keys(formdata)
.map((key) => {
let vals = formdata[key];
let isArray = Array.isArray(vals);
let keys = encode(key + (isArray ? "[]" : ""));
if (!isArray) vals = [vals];
let out = [];
for (let valq of vals) out.push(keys + "=" + encode(valq));
return out.join("&");
})
.join("&");
return await fetch(`${url}?${body}`, {
method: "GET",
headers: {
Accept: "*/*",
"Accept-Language": "en-US,en;q=0.9",
"User-Agent": "GoogleBot",
Cookie: cookies,
},
});
}

//Text Pro
async function textpro(url, text) {
if (!/^https:\/\/textpro\.me\/.+\.html$/.test(url))
throw new Error("Enter a Valid URL");
const geturl = await fetch(url, {
method: "GET",
headers: {
"User-Agent": "GoogleBot",
},
});
const load_token = await geturl.text();
let cookies = geturl.headers.get("set-cookie").split(",").map((v) => cookie.parse(v)).reduce((a, c) => {
return { ...a, ...c };
}, {});
cookies = {
__cfduid: cookies.__cfduid,
PHPSESSID: cookies.PHPSESSID
};
cookies = Object.entries(cookies)
.map(([name, value]) => cookie.serialize(name, value))
.join("; ");
const $ = cheerio.load(load_token);
const token = $('input[name="token"]').attr("value");
const form = new FormData();
if (typeof text === "string") text = [text];
for (let texts of text) form.append("text[]", texts);
form.append("submit", "Go");
form.append("token", token);
form.append("build_server", "https://textpro.me");
form.append("build_server_id", 1);
const geturl2 = await fetch(url, {
method: "POST",
headers: {
Accept: "*/*",
"Accept-Language": "en-US,en;q=0.9",
"User-Agent": "GoogleBot",
Cookie: cookies,
...form.getHeaders(),
},
body: form.getBuffer(),
});
const atoken = await geturl2.text();
const token2 = /<div.*?id="form_value".+>(.*?)<\/div>/.exec(atoken);
if (!token2) {
var status_err = new Object();
status_err.status = false
status_err.error = "Error! This token is not acceptable!"
return status_err;
}
const prosesimage = await post(
"https://textpro.me/effect/create-image",
JSON.parse(token2[1]),
cookies
);
const image_ret = await prosesimage.json();
return `https://textpro.me${image_ret.fullsize_image}`;
}

// MediaFire
async function mediafire(url) {
let query = await axios.get(url) 
let cher = cheerio.load(query.data)
let hasil = []
let link = cher('a#downloadButton').attr('href')
let size = cher('a#downloadButton').text().replace('Download', '').replace('(', '').replace(')', '').replace('\n', '').replace('\n', '').replace(' ', '')
let seplit = link.split('/')
let name = seplit[5]
let mime = name.split('.')
mime = mime[1]
hasil.push({ author, name, mime, size, link })
return hasil
}

// StyleText
async function styletext(teks) {
return new Promise((resolve, reject) => {
axios.get('http://qaz.wtf/u/convert.cgi?text='+teks)
.then(({ data }) => {
let $ = cheerio.load(data)
let hasil = []
$('table > tbody > tr').each(function (a, b) {
hasil.push({ author, name: $(b).find('td:nth-child(1) > span').text(), result: $(b).find('td:nth-child(2)').text().trim() })
})
resolve(hasil)
})
})
}

// Downloader
async function aiovideodl(link) {
return new Promise((resolve, reject) => {
axios({
url: 'https://aiovideodl.ml/',
method: 'GET',
headers: {
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
"cookie": "PHPSESSID=69ce1f8034b1567b99297eee2396c308; _ga=GA1.2.1360894709.1632723147; _gid=GA1.2.1782417082.1635161653"
}
}).then((src) => {
let a = cheerio.load(src.data)
let token = a('#token').attr('value')
axios({
url: 'https://aiovideodl.ml/wp-json/aio-dl/video-data/',
method: 'POST',
headers: {
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
"cookie": "PHPSESSID=69ce1f8034b1567b99297eee2396c308; _ga=GA1.2.1360894709.1632723147; _gid=GA1.2.1782417082.1635161653"   
},
data: new URLSearchParams(Object.entries({ 'url': link, 'token': token }))
}).then(({ data }) => {
resolve(data)
})
})
})
}

// PlayStore
async function playstore(name){
return new Promise((resolve, reject) => {
axios.get('https://play.google.com/store/search?q='+ name +'&c=apps')
.then(({ data }) => {
const $ = cheerio.load(data)
let ln = [];
let nm = [];
let dv = [];
let lm = [];
const result = [];
$('div.wXUyZd > a').each(function(a,b){
const link =  'https://play.google.com' + $(b).attr('href')
ln.push(link);
})
$('div.b8cIId.ReQCgd.Q9MA7b > a > div').each(function(d,e){
const name = $(e).text().trim()
nm.push(name);
})
$('div.b8cIId.ReQCgd.KoLSrc > a > div').each(function(f,g){
const dev = $(g).text().trim();
dv.push(dev)
})
$('div.b8cIId.ReQCgd.KoLSrc > a').each(function(h,i){
const limk = 'https://play.google.com' + $(i).attr('href');
lm.push(limk);
})
for (let i = 0; i < ln.length; i++){
result.push({
author,
name: nm[i],
link: ln[i],
developer: dv[i],
link_dev: lm[i]
})
}
resolve(result)
})
.catch(reject)
})
}


module.exports = { styletext, textpro, aiovideodl, mediafire, playstore }