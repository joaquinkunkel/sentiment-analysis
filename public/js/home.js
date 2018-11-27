var runData = {
        "documents": [
            {
                "language": "en",
                "id": "1",
                "text": "We love this trail and make the trip every year. The views are breathtaking and well worth the hike!"
            },
        ]
    };

function processData(text){
  var runData = {
    "documents": [
      {
        "language": "en",
        "id": "1",
        "text": text
      }
    ]
  };
  return runData;
}


// <div class="card" style="width: 18rem;">
//   <div class="card-body">
//     <h5 class="card-title">Card title</h5>
//     <h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6>
//     <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
//     <a href="#" class="card-link">Card link</a>
//     <a href="#" class="card-link">Another link</a>
//   </div>
// </div>

function appendErrorTweet(){
  $("#twitterData").html("This user is private or does not exist. Please try another search.")
}


function appendTweetData(query, mode, data){
  var colors = [
    "#ff5b8a",

    "#ff6459",

    "#ffb759",

    "#f1f44b",

    "#3df7a0",
  ];

  $("#twitterData").html("");
  $("#results-heading").html("");
  $("#results-heading").html("<h3 ml-4 mb-3 pl-4><span class='text-muted'>Tweets found for </span>" + (mode == 0 ? "@" : "#") + query  +"</h3>");

  for(i in data.tweets){
    var tweet = data.tweets[i];
    $("#twitterData").append(
        "<div class='card m-2'>"
          + "<div class='card-body'>"
              + "<div style='display:flex;align-items:flex-start'>"
              + "<img src='" + tweet.user.picture + "' class='profile-picture mr-3'/>"
              + "<div>"
                  + "<h6 class'card-subtitle mb-2 text-muted'>" + tweet.user.name + "<span class='text-muted'> @" + tweet.user.screen_name + "</span></h6>"
                  + "<p class='card-text'>" + tweet.text + "</p>"
                  + "<span class='score'"
                  + " style='background: " + colors[Math.floor(data.scores[i].score * 5)]
                  + "'>"
                  + (Math.floor(data.scores[i].score * 1000) / 10)
                  + "</span>"
              + "</div>"
          + "</div>"
      + "</div>"
    );
  }

  /* Compute the average score of all the tweets found */
  var total_score = 0;
  for(i in data.scores){
    total_score = total_score + data.scores[i].score;
  }
  total_score = Math.floor(total_score * 1000 / data.scores.length) / 10;
  $("#averageScore").html(total_score);
  $('.progress-bar').css('width', (total_score)+'%').attr('aria-valuenow', total_score)

}

$('#textForm').on('submit', function(e){
  e.preventDefault();
  var text = $('#text_0').val();
  var jsonData = processData(text);
  $("#twitterData").html("");
  $("#results-heading").html("<h3 class='text-muted'>Loading...</h3>")

  $.ajax({
      url: "/analyze",
      type: "POST",
      data: JSON.stringify(jsonData),
      contentType: "application/json",
      success: function(data, status) {
        var score = Math.floor(JSON.parse(data).documents[0].score * 1000) / 10;
        $("#averageScore").html(score);
        $('.progress-bar').css('width', (score)+'%').attr('aria-valuenow', score)
        $("#results-heading").html("<h3 ml-4 pl-4><span class='text-muted'>Text: </span>" + text +"</h3>");
      }
  });
});


$("#twitterForm").on('submit', function(e){
  e.preventDefault();
  var twitterQuery = {
    reqQuery: $("#screenName").val(),
    reqCount: $("#count").val(),
    reqMode: $('input[name=tweetMode]:checked').val(), // 0 is user search mode, 1 is hashtag search mode
    hashtag: $("#hashtag").val()
  };

  $("#twitterData").html("");
  $("#results-heading").html("<h3 class='text-muted'>Loading...</h3>")

  $.ajax({
    url: "/analyze_tweets", // Indicating to the server what to do
    type: "POST", // in the server, this will be app.post("/analyze_tweets", function(req, res, err){...})
    data: JSON.stringify(twitterQuery), // This is the data that in the server is stored in req.body
    contentType: "application/json",
    success: function(data, status) {
        if(!data) appendErrorTweet();
        appendTweetData(twitterQuery.reqQuery, twitterQuery.reqMode, data);
    }
  });
});
