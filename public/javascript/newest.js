

var newsXPage = 2;
var lastNew = -1;

var news = [
    {
        id: "0001",
        title: "Documenting Sony Memory Stick",
        user: "elvis70",
        link: "https://news.ycombinator.com/from?site=dmitry.gr",
        points: 30,
        comments: 8,
        publishedDate: new Date("2021-03-13T09:20:00.000Z")
    },
    {
        id: "0002",
        title: "RePalm",
        user: "racarmo",
        link: "https://www.getcruise.com/news/a-new-kind-of-equity-program/",
        points: 78,
        comments: 5,
        publishedDate: new Date("2021-07-21T00:17:40.000Z")
    },
    {
        id: "0003",
        title: "Reverse Engineering an Unknown Microcontroller",
        user: "maria",
        link: "https://manifold.markets/Austin/what-database-will-manifold-be-prim",
        points: 25,
        comments: 0,
        publishedDate: new Date ("2021-08-20T03:15:30.000Z")
    },
    {
        id: "0004",
        title: "Linux on an 8-Bit Micro? ",
        user: "pepe",
        link: "https://textslashplain.com/2017/01/14/the-line-of-death/",
        points: 50,
        comments: 8,
        publishedDate: new Date("2021-10-02T15:05:00.000Z")
    }
]

/*
  https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
*/
function time_ago(time) {

    switch (typeof time) {
      case 'number':
        break;
      case 'string':
        time = +new Date(time);
        break;
      case 'object':
        if (time.constructor === Date) time = time.getTime();
        break;
      default:
        time = +new Date();
    }
    var time_formats = [
      [60, 'seconds', 1], // 60
      [120, '1 minute ago', '1 minute from now'], // 60*2
      [3600, 'minutes', 60], // 60*60, 60
      [7200, '1 hour ago', '1 hour from now'], // 60*60*2
      [86400, 'hours', 3600], // 60*60*24, 60*60
      [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
      [604800, 'days', 86400], // 60*60*24*7, 60*60*24
      [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
      [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
      [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
      [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
      [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
      [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
      [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
      [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    var seconds = (+new Date() - time) / 1000,
      token = 'ago',
      list_choice = 1;
  
    if (seconds == 0) {
      return 'Just now'
    }
    if (seconds < 0) {
      seconds = Math.abs(seconds);
      token = 'from now';
      list_choice = 2;
    }
    var i = 0,
      format;
    while (format = time_formats[i++])
      if (seconds < format[0]) {
        if (typeof format[2] == 'string')
          return format[list_choice];
        else
          return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
      }
    return time;
  }
  


const showNews = () => {
    
    $( ".newInfo" ).remove();
    $( ".newActions" ).remove();
    $( ".space-10px").remove();


    
    for(let i = lastNew+1; i <= Math.min(news.length-1, lastNew+newsXPage); i++) {
        let element = news[i];

        let domain = (new URL(element.link).hostname);
        let comments;
        if (element.comments === 0) comments = "discuss";
        else comments = element.comments + " comments";

        $("#moreButton").before(`
        
            <tr id="${element.id}" class="newInfo">
                <td class="oderNum">${i+1}.</td>
                <td class="voteButton"><i id="${element.id}" class="fas fa-heart"></i></td>
                <td class="title">
                    <a class="newTitle titleText" href="${element.link}">${element.title}</a>
                    <a class="newLink" href="#">(${domain})</a>
                </td>
            </tr>
            <tr class="newActions">
                <td colspan="2"></td>
                <td>
                    <span id="votes_${element.id}">${element.points} points</span>
                    by
                    <a href="#">${element.user}</a>
                    &nbsp
                    <span title="${element.publishedTime}">
                        <a href="#">${time_ago(element.publishedDate)}</a>
                    </span>
                    &nbsp
                    |
                    <a href="#">hide</a>
                    |
                    <a href="#">${comments}</a>
                </td>
            </tr>
            <tr class   ="space-10px"></tr>
        `)
    }
    lastNew = Math.min(news.length-1, lastNew+newsXPage)
    if (lastNew == news.length-1) $("#moreButton").hide();
    /*
    $("#allNews").append(`
        <tr>
            <td colspan="2"></td>
            <td><a class="titleText" href="#">More</a></td>
        </tr>
    `)
    */
}


window.onload = function() {
    news.sort((a, b) => b.publishedDate - a.publishedDate);
    showNews();
    //$("#more").on('click', console.log("click"))
}