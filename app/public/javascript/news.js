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
        published: ""
    },
    {
        id: "0002",
        title: "RePalm",
        user: "racarmo",
        link: "https://www.getcruise.com/news/a-new-kind-of-equity-program/",
        points: 78,
        comments: 5,
        published: ""
    },
    {
        id: "0003",
        title: "Reverse Engineering an Unknown Microcontroller",
        user: "maria",
        link: "https://manifold.markets/Austin/what-database-will-manifold-be-prim",
        points: 25,
        comments: 0,
        published: ""
    },
    {
        id: "0004",
        title: "Linux on an 8-Bit Micro? ",
        user: "pepe",
        link: "https://textslashplain.com/2017/01/14/the-line-of-death/",
        points: 50,
        comments: 8,
        publishedTime: ""
    },
]

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
                        <a href="#">1 hour ago</a>
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
    news.sort((a,b) => (a.points > b.points) ? 0 : 1)
    //showNews();
    //$("#more").on('click', console.log("click"))
}