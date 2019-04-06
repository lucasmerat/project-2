var path = window.location.pathname;

function writeCookie(value, variable) {
  var now = new Date();
  now.setMonth(now.getMonth() + 1);
  cookievalue = value + ";";
  document.cookie =
    variable + "=" + cookievalue + "expires=" + now.toUTCString() + ";";
}

function ReadCookie() {
  var allcookies = document.cookie;

  // Get all the cookies pairs in an array
  var cookiearray = [];
  if (allcookies.length > 1) {
    cookiearray = allcookies.split(";");
  }
  // Now take key value pair out of this array
  if (cookiearray.length > 0) {
    username = cookiearray[0].split("=")[1];
    log = cookiearray[1].split("=")[1];
    return { username: username, log: log };
  } else {
    return { log: false };
  }
}

function deleteCookie(value, variable) {
  var now = new Date();
  now.setMonth(now.getMonth() - 1);
  cookievalue = value + ";";
  document.cookie =
    variable + "=" + cookievalue + "expires=" + now.toUTCString() + ";";
}
//Log Out,
$(".logout").on("click", function(event) {
  console.log("Logout button clicked");
  event.preventDefault();
  var logged = ReadCookie();
  deleteCookie(logged.username, "username");
  deleteCookie(logged.log, "log");
  window.location.pathname = "/";
});

$(".create-user").on("submit", function(event) {
  // Make sure to preventDefault on a submit event.
  event.preventDefault();
  console.log("Click");
  var email = $("#email")
    .val()
    .trim();
  var password = $("#password")
    .val()
    .trim();
  var username = $("#userName")
    .val()
    .trim();
  if (email === "" || password === "" || username === "") {
    return;
  }

  var newUser = {
    username: username,
    email: email,
    password: password
  };

  // Send the POST request.
  $.ajax("/api/signup", {
    type: "POST",
    data: newUser
  }).then(function(signup) {
    console.log(signup);
    console.log("Created new user");
    window.location.pathname = "/signin";
  });
});

$(".login-user").on("submit", function(event) {
  // Make sure to preventDefault on a submit event.
  event.preventDefault();
  var email = $("#emailLog")
    .val()
    .trim();
  var password = $("#passwordLog")
    .val()
    .trim();
  if (email === "" || password === "") {
    return;
  }

  var User = {
    email: email,
    password: password
  };

  // Send the POST request.
  $.ajax("/api/signin", {
    type: "POST",
    data: User
  }).then(function(logged) {
    if (logged.status) {
      console.log("User has logged");
      writeCookie(logged.username, "username");
      writeCookie(logged.status, "log");
      window.location.pathname = "/dashboard";
    } else {
      console.log("Wrong Input");
    }
  });
});

//Check if is already logged
var logged = ReadCookie();
if (logged.username !== undefined) {
  console.log("Already logged");
} else {
  console.log("No one is logged");
}
console.log(ReadCookie());

//Populate Top Beers
if (path === "/dashboard") {
  $.ajax("/api/beers/top", {
    type: "GET"
  }).then(function(Beers) {
    var Quantity = 5;
    if (Beers.length < Quantity) {
      Quantity = Beers.length;
    }
    for (var i = 0; i < Quantity; i++) {
      var item =
        "<li class='collection-item'><div>" +
        Beers[i].Name +
        "| Count:" +
        Beers[i].Quantity +
        "<a data-name=" +
        Beers[i].Name +
        " class='secondary-content'><i class='material-icons'>Info</i></a></div></li>";
      $(".topBeers").append(item);
    }
  });
}

//Populate Beers Timeline
if (path === "/dashboard") {
  $.ajax("/api/beers", {
    type: "GET"
  }).then(function(Beers) {
    var Quantity = 5;
    if (Beers.length < Quantity) {
      Quantity = Beers.length;
    }
    var BeerNames = [];
    var BeerTimes = [];
    var UserNames = [];
    for (var i = 0; i < Quantity; i++) {
      BeerNames.push(Beers[i].name);
      BeerTimes.push(Beers[i].createdAt);
      console.log(Beers[i].UserId);
      var UserPath = "/api/users/" + Beers[i].UserId;
      $.ajax(UserPath, {
        type: "GET"
      }).then(function(User) {
        console.log(UserPath);
        console.log(User);
        UserNames.push(User.username);
      });
    }

    //Create Table
    setTimeout(function() {
      for (var i = 0; i < Quantity; i++) {
        var item =
          "<li class='collection-item avatar'><i class='material-icons circle green'>insert_chart</i><span class='title'>Username:" +
          UserNames[i] +
          " </span><p>Beer Drank:" +
          BeerNames[i] +
          "<br>Time:" +
          Beers[i].createdAt +
          " <br>Location: <i class='fas fa-1x fa-map-marker-alt text-orange mb-4'></i></p><a data-user=" +
          UserNames[i] +
          " class='secondary-content'><i class='material-icons'>View Profile</i></a></li>";
        $(".timelineUsers").append(item);
      }
    }, 300);
  });
}

if (path === "/profile") {
  var username = ReadCookie().username;
  console.log(username);
  $(".usernameTitle").text(username);

  // User total beers
  $.ajax("/api/users/total/" + username, {
    type: "GET"
  }).then(function(Total) {
    $(".numbersTotal").text(Total);
  });

  //User top Beers & Unique Beers
  $.ajax("/api/users/top/" + username, {
    type: "GET"
  }).then(function(Top) {
    $(".numbersUnique").text(Top.length);
    for (var i = 0; i < 3; i++) {
      console.log(Top[i].Name, Top[i].Quantity);
      var item =
        "<li>" + Top[i].Name + " - " + Top[i].Quantity + " Drinks</li>";
      $(".userTop").append(item);
    }
  });

  //User Timeline
  $.ajax("/api/users/timeline/" + username, {
    type: "GET"
  }).then(function(Timeline) {
    for (var i = 0; i < 5; i++) {
      var item =
        "<li class='collection-item'><i class='fas fa-beer'></i> " +
        Timeline[i].name +
        " <i class='fas fa-question-circle grey-text'></i> <span class='right'>" +
        Timeline[i].createdAt +
        "</span></li>";
      $(".userTimeline").append(item);
    }
  });
}
$(".search-beer").on("click", function() {
  var beerSearched = $("#beerSearched").val().trim();
  $.ajax("/api/data/" + beerSearched, {
    type: "GET"
  }).then(function(result){
    $(".table-section").empty()
    if(result.length > 0){
      $(".table-section").append(`
    <table>
      <thead>
        <tr>
          <th>Beer Name</th>
          <th></th>
        </tr>
      </thead>
      <tbody class="search-beer-list">

      </tbody>
    </table>
`)
    result.forEach(function(beer){
      console.log(beer)
      $(".search-beer-list").append(`
      <tr>
      <td>${beer.name}</td>
      <td><a id="log-drink" class="btn halfway-fab waves-effect waves-light orange right" data-id="${beer.id}">+</a></td>
      </tr>
`)
    });
    } else {
      $(".table-section").append(`<p>Beer not found, try another, or add your own to our database</p>
      <button class="btn halfway-fab waves-effect waves-light orange">Add beer to database</button>
      `)
      
    }
    
    console.log(result)
  })
});

$(document).on('click', '#log-drink', function(){
  let index = document.cookie.indexOf(';')
  let email = document.cookie.slice(6, index)
  let dataId = $(this).attr("data-id")
  console.log(dataId)
  $.ajax("/api/users/addDrink", {
    type:"PUT",
    data: {
      email: email,
      dataId: dataId
    }
  }).then(function(result){
    console.log(result)
  })
})
