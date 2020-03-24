// To Do
// Implement Larger Numbers // done  for now probably
// Implement ... for many terms // after more autobuyers
// Implement digit decrease bound // done
// Implement End Game // starting, need tabs
//
// Implement buying more autobuyers //
// Implement Saving // trying // done
// Implement bulk dig decrease, or auto dig decrease // done
//
// Learn how to make tabs, options, challenges, acheivements //
//

var game = {};
var D = OmegaNum;

function cost_curve(x) {
  if (x == 0) {
    return 1;
  }
  return Math.ceil(Math.min(3 * x, 2 * (x + 20)) / 6);
}

function func(x) {
  let result = D(0);
  for (let i = 0; i < game.f.length; i++) {
    result = D.add( result, D.mul( D(game.f[i]), D.pow(x, D(i) ) ) )
  }
  return result;
}

function basis(m) {
  let array = [];
  for (let i = 0; i < m; i++) {
    array.push(0);
  }
  array.push(1);
  return array;
}

const words = ["constant", "linear", "quad", "cubic", "quart", "quint", "hex"];
const words_full = [
    "constant",
    "linear",
    "quadratic",
    "cubic",
    "quartic",
    "quintic",
    "hexic"
  ];
const auto_words = ["auto past cap", "auto until cap", "turn off"];

function getNewSave() { // setup
  game.cash = D(10);
  game.digits = D(100);
  game.n = D(1);

  game.auto_cashb = 0;

  game.flength = 1;
  game.f = [1]

  game.automatic = false;

  game.timer = setInterval(cashout, 1000 / (game.auto_cashb + 1));
  clearInterval(game.timer);


  game.buy_timer = [
    setInterval(buy_auto, 1000, 1, 0),
    setInterval(buy_auto, 1000, 2, 0),
    setInterval(buy_auto, 1000, 3, 0),
    setInterval(buy_auto, 1000, 4, 0),
    setInterval(buy_auto, 1000, 5, 0),
    setInterval(buy_auto, 1000, 6, 0)
  ];
  for (let i = 0; i < 5; i++) {
    clearInterval(game.buy_timer[i]);
  }
  game.auto_array = [
    [0, false],
    [0, false],
    [0, false],
    [0, false],
    [0, false],
    [0, false]
  ];

  document.getElementById("dig_dec").innerHTML = "Decrease"
  document.getElementById("dig_dec").classList.add("invis")

  game.d0 = D(0)
}


function main() {
  document.getElementById("defaultOpen").click();

  getNewSave();

  load();
  while (game.f.length < game.flength){ // OmegaNum can't load an array whose size changes, so this is getting around that gay shit
    game.f.push(0)
  }
  load();

  // Refreshing

  if ( game.auto_cashb >= 1 ){
    game.timer = setInterval(cashout, 1000 / (game.auto_cashb + 1));
  }

  for ( let i = 1; i < Math.min( game.f.length +1, 7); i++){
    document
      .getElementById(words[i])
      .classList.remove("invis");
    document
      .getElementById("shop" + i )
      .classList.remove("invis");
  }

  for ( let i = 1; i < Math.min( game.n , 7); i++){
    document
      .getElementById(words[i] + "_auto")
      .classList.remove("invis");

    if (game.auto_array[i - 1][1]) {
      document.getElementById(words[i] + "_auto").innerHTML = auto_words[game.auto_array[i - 1][0]];
      clearInterval(game.buy_timer[i - 1]);
      game.buy_timer[i - 1] = setInterval(buy_auto, 1000, i, game.auto_array[i - 1][0]);
    }
  }

  if ( game.f.length >= 7 && game.digits != 2) {
    document.getElementById("dig_dec_txt").classList.remove("invis");
    document.getElementById("dig_dec").classList.remove("invis");
  } else if ( game.digits == 2 && game.cash >= 10 ** 20) {
    document.getElementById("dig_dec").classList.remove("invis")
  }

  if (game.automatic == false) {
    document.getElementById("auto").innerHTML = "auto";
  } else {
    document.getElementById("auto").innerHTML = "unauto";
  }

  // End of refreshing

  refresh()

  //let subtabs = ["coolUpgrades", "primaryRealm", "optionsTab"];
  //for (let i = 0; i < subtabs.length; i++) document.getElementById(subtabs[i]).style.display = "none";

  setInterval(save, 500);

  document.getElementById("cashb_auto").addEventListener("click", function() {
    if (D.gte(game.cash, 10 ** 7)) {
      clearInterval(game.timer);
      game.timer = setInterval(cashout, 1000 / (game.auto_cashb + 1));
      game.cash = D.sub(game.cash,10 ** 7); //10**(auto_cashb + 5)
      game.auto_cashb++;
    }
    if (game.auto_cashb == 0) {
      // Smaller refresh()
      document.getElementById("cashb_auto").innerHTML =
        1 + game.auto_cashb + " click/s";
    } else {
      document.getElementById("cashb_auto").innerHTML =
        1 + game.auto_cashb + " clicks/s";
    }
    document.getElementById("money_display").innerHTML = "$" + notation(game.cash);
  });

  document.getElementById("auto").addEventListener("click", function() {
    if ( game.automatic == false ) {
      game.automatic = true;
      document.getElementById("auto").innerHTML = "unauto";
    } else {
      game.automatic = false;
      document.getElementById("auto").innerHTML = "auto";
    }
  });

  document.getElementById("dig_dec").addEventListener("click", function() {
    if ( game.cash >= 10 ** 20 ) {
      if ( game.digits > 2 ){

        let s = D.log10( game.cash ).toString()
        let decimalPlace = s.indexOf(".")
        let stringAmount = s.slice(0, decimalPlace )
        if (decimalPlace == -1){
          stringAmount = s
        }
        let amountOver = D.sub( D.fromString( stringAmount ), 19 )

        dec_dig( amountOver );
      } else {
        // // // ///////////////////////////////////////////// begin end game
        dec_dig( 0 );
        document.getElementById("money_display").classList.add("invis");
        document.getElementById("digits").classList.add("invis");
        document.getElementById("auto").classList.add("invis");

        game.n = D(0);

        document.getElementById("shop1").classList.add("invis");
        document.getElementById(words[1]).classList.add("invis");
        document.getElementById("input_inc_txt").innerHTML = "Increase the input.";

        document.getElementById("cashb_text").classList.add("invis");
        document.getElementById("cashb").classList.add("invis");
        document.getElementById("cashb_auto").classList.add("invis");

        document.getElementById("display").innerHTML =
          '<img src="geom.png">';

      }
    }
  });
}
main();

function cashout() {
  game.cash = D.add( game.cash, func( D.sub(D(100), game.digits).plus(game.n) ) );
  document.getElementById("money_display").innerHTML = "$" + notation( game.cash );
}

function input_inc() {
  if ( document.getElementById("money_display").classList.contains("invis") ) {
    game.d0++;
    startOver();
  } else if (game.f[Math.min(game.n, 6)] >= Math.min(10, game.digits - 1)) {
    game.f[Math.min(game.n, 6)] = 0;
    game.n++;
    game.cash = 0;
    refresh();
    if ( D.lte(game.n, 7) ) {
      document.getElementById(words[game.n - 1] + "_auto").classList.remove("invis");
    }
  }
} // Increases the input to the function in cashout

function buy(m) {
  if ( D.gte( game.cash, D(cost(m)) ) ) {
    game.cash -= cost(m);
    game.f = array_add(basis(m), game.f);
    game.flength = game.f.length
    show();
    if (game.automatic == true) {
      input_inc();
    }
    refresh(); // could make this refresh smaller
    // this seems to be where the flickering cash display is coming from
    // the flickering happens prefectly in time with the increasing of the terms
  }
} // Adds terms to the function and deals with cash

function buy_auto(m, k) {
  switch (k) {
    case 1:
      buy(m);
      break;
    case 2:
      if (game.f[m] < game.digits - 1) {
        buy(m);
      }
      break;
    default:
      break;
  }
} //

function auto_activate(m) {
  if (game.auto_array[m - 1][1]) {
    game.auto_array[m - 1][0] = (game.auto_array[m - 1][0] + 1) % 3;
    document.getElementById(words[m] + "_auto").innerHTML = auto_words[game.auto_array[m - 1][0]];
    clearInterval(game.buy_timer[m - 1]);
    game.buy_timer[m - 1] = setInterval(buy_auto, 1000, m, game.auto_array[m - 1][0]);
  } else if (game.cash >= 10 ** (Math.floor((m * (9 + m)) / 10) + 3)) {
    game.cash -= 10 ** (Math.floor((m * (9 + m)) / 10) + 3);
    clearInterval(game.buy_timer[m - 1]);
    game.buy_timer[m - 1] = setInterval(buy_auto, 1000, m, 1);
    game.auto_array[m - 1][1] = true;
    document.getElementById(words[m] + "_auto").innerHTML =
      auto_words[++game.auto_array[m - 1][0]];
    document.getElementById("shop" + m).innerHTML =
      "Buy a " + words_full[m] + " term for $" + notation(cost(m)) + ".";
  }
  document.getElementById("money_display").innerHTML = "$" + notation(game.cash);
} //

function array_add(a, b) {
  if (a.length >= b.length) {
    let result = a.slice();
    for (let i = 0; i < b.length; i++) {
      let x = a[i] + b[i];
      if (x >= game.digits) {
        if (i == result.length - 1) {
          result.push(1);
        } else if (i == b.length - 1) {
          b.push(1);
        } else {
          b[i + 1] += 1;
        }
      }
      result[i] = x % game.digits;
    }
    return result;
  } else {
    return array_add(b, a);
  }
} //

function show() {
  let g  = game.f.length
  if (g == 7 && game.digits != 2) {
    document.getElementById("dig_dec_txt").classList.remove("invis");
    document.getElementById("dig_dec").classList.remove("invis");
  } else if ( game.digits == 2 && game.cash >= 10 ** 20) {
    document.getElementById("dig_dec").classList.remove("invis")
    document.getElementById("dig_dec").classList.add("limit-button")
  }

  if ( g < 7 ){
    document
      .getElementById(words[g])
      .classList.remove("invis");
    document
      .getElementById("shop" + g)
      .classList.remove("invis");
  }
  refresh();
} // Makes invisible things visible

function cost(x) {
  if (x > game.f.length - 1) {
    return 10 ** Math.floor((x * (9 + x)) / 10);
  } else {
    return 10 ** Math.floor((x * (9 + x)) / 10) * cost_curve(game.f[x]);
  }
} // Determines cost based off of cost_curve and array values

function refresh() {
  document.getElementById("money_display").innerHTML = "$" + notation(game.cash);
  if (game.digits != 100) {
    document.getElementById("display").innerHTML =
      "f(x) =" +
      func_to_string() +
      "<br>f(" +
      game.n +
      " + " +
      (100 - game.digits) +
      ") = " +
      comma( func( D.add(game.n, D.sub(D(100), game.digits) ) ) );
  } else {
    document.getElementById("display").innerHTML =
      "f(x) =" + func_to_string() + "<br>f(" + game.n + ") = " + comma(func(game.n));
  }
  document.getElementById("digits").innerHTML = "(" + game.digits + " digits)"; // Can move to dec_dig, not essential

  if (game.digits != 100) {
    document.getElementById("cashb").innerHTML =
      "+ f(" + game.n + "+" + (100 - game.digits) + ")";
  } else {
    document.getElementById("cashb").innerHTML = "+ f(" + game.n + ")";
  }

  for (let i = 1; i < 7; i++) {
    // Update all of the terms costs
    let append = "";

    if ( !document.getElementById(words[i] + "_auto").classList.contains("invis") ) {
      // Show if button is visible
      append =
        " Buy automation for $" +
        notation(10 ** (Math.floor((i * (9 + i)) / 10) + 3)) +
        ".";
    }
    if (game.auto_array[i - 1][1]) {
      append = "";
    }
    document.getElementById("shop" + i).innerHTML =
      "Buy a " +
      words_full[i] +
      " term for $" +
      notation( D( cost(i) ) ) +
      "." +
      append;
  }

  if (game.auto_cashb == 0) {
    document.getElementById("cashb_auto").innerHTML =
      1 + game.auto_cashb + " click/s";
  } else {
    document.getElementById("cashb_auto").innerHTML =
      1 + game.auto_cashb + " clicks/s";
  }

  document.getElementById("input_inc_txt").innerHTML =
    "Increase the input on cash out by trading in " +
    Math.min( 10, game.digits - 1 ) +
    " " +
    words_full[ Math.min( game.n, 6 ) ] +
    " terms, sacrificing the rest and losing your money.";

  if ( D.gte( game.cash, 10**20 ) ){
    let s = D.log10( game.cash ).toString()
    let decimalPlace = s.indexOf(".")
    let stringAmount = s.slice( 0, decimalPlace )
    if (decimalPlace == -1){ stringAmount = s }
    let amountOver = D.sub( D.fromString( stringAmount ), 19 )
    if ( D.gte( game.cash, 10**21 ) ){
      document.getElementById("dig_dec_txt").innerHTML =
        "Decrease the number of digits by " + amountOver +
        " for $10<sup>" + stringAmount + "</sup> and reseting everything."
    } else {
      document.getElementById("dig_dec_txt").innerHTML =
        "Decrease the number of digits for $10<sup>"
        + stringAmount + "</sup> and reseting everything."
    }
    if ( D.lte( D.sub( game.digits, amountOver ), 2 ) ) {
      document.getElementById("dig_dec_txt").innerHTML =
        "Decrease the number of digits to 2 for $10<sup>"
        + D.add( D.sub( game.digits, 2 ), 19 ) + "</sup> and reseting everything."
    }
  } else {
    document.getElementById("dig_dec_txt").innerHTML =
        "Decrease the number of digits for $10<sup>20</sup> and reseting everything."
  }
} // Refreshes the screen

function func_to_string() {
  let result = " 1";
  for (let i = 1; i < game.f.length; i++) {
    // Start after the constant term so you dont have x^0, which looks ugly
    if (game.f[i] != 0 || game.digits == 2) {
      // Don't write terms with 0 out front
      result += " + ";
      if (game.f[i] != 1 || game.digits == 2) {
        // Don't write the 1 out front
        result += game.f[i];
      }
      result += "x";
      if (i != 1) {
        // Don't write the 1 in the exponent
        result += "<sup>" + i + "</sup>";
      }
    }
  }
  return result;
} // Turns the function into a string to display

function notation(num) {
  let s = num.toString()
  if ( s.indexOf("e") == -1 ) {
    if (D.lte(num, D(10000))) {
      return num;
    }
    let exp = s.length -1
    let front = String( Math.floor( D.div( num, D.pow(10, exp-2) ) ) )
    return front[0] + "." + front[1] + front[2] + " x10<sup>" + exp + "</sup>"
  }
  return (
    s.slice(0, 4) +
    " x10<sup>" +
    s.slice( s.indexOf('e') + 1 ) +
    "</sup>"
  );
} // Changes the numbers to be displayed

function comma(num) {
  let s = num.toString()
  if ( s.indexOf("e") == -1 ) {
    let result = "";
    let l = String(num).length - 1;
    for (let i = 0; i <= l; i++) {
      result = String(num)[l - i] + result;
      if (i % 3 == 2 && l - i != 0) {
        result = "," + result;
      }
    }
    return result;
  }
  return (
    s.slice(0, 4) +
    " x10<sup>" +
    s.slice( s.indexOf('e') + 1 ) +
    "</sup>"
  );
} // Changes the numbers to be commas, up until it changes to scientific

function dec_dig( amount ) {
  game.cash = D(10);
  if ( D.sub( game.digits, amount ) < 2 ) {
    game.digits = 2
  } else {
    game.digits = D.sub( game.digits, amount );
  }

  game.n = D(1);
  clearInterval(game.timer);
  for (let i = 0; i < 6; i++) {
    clearInterval(game.buy_timer[i]);
  }

  game.auto_array = [
    [0, false],
    [0, false],
    [0, false],
    [0, false],
    [0, false],
    [0, false]
  ];

  for (let i = 1; i < 7; i++) {
    document.getElementById(words[i] + "_auto").innerHTML = auto_words[0];
    document.getElementById(words[i] + "_auto").classList.add("invis");
  }

  game.auto_cashb = 0;
  game.f = [1];

  for (let i = 2; i < 7; i++) {
    document.getElementById("shop" + i).classList.add("invis");
    document.getElementById(words[i]).classList.add("invis");
  }

  document.getElementById("dig_dec_txt").classList.add("invis");
  document.getElementById("dig_dec").classList.add("invis");

  game.automatic = false;
  document.getElementById("auto").innerHTML = "auto";

  if ( game.digits != 2 ) {
    document.getElementById("dig_dec_txt").innerHTML = "Decrease the number of digits for $10<sup>20</sup> and reseting everything."
  } else {
    document.getElementById("dig_dec").innerHTML = "Limit f(x)."
    document.getElementById("dig_dec").classList.add("invis")
  }
  refresh();
} // Decreases the number og digits by a certain amount

function startOver() {
  document.getElementById("money_display").classList.remove("invis")

  document.getElementById("money_display").classList.remove("invis");
  document.getElementById("digits").classList.remove("invis");
  document.getElementById("auto").classList.remove("invis");

  game.digits = D(100)
  game.n = D(1);
  game.f = [1]
  game.flength = game.f.length

  document.getElementById("shop1").classList.remove("invis");
  document.getElementById(words[1]).classList.remove("invis");
  document.getElementById("input_inc_txt").innerHTML = "Increase the input on cash out by trading in 10 linear terms, sacrificing the rest and losing your money.";

  document.getElementById("cashb_text").classList.remove("invis");
  document.getElementById("cashb").classList.remove("invis");
  document.getElementById("cashb_auto").classList.remove("invis");

  document.getElementById("display").innerHTML = "f(x) = 1<br />f(1) = 1";

  document.getElementById("dig_dec").innerHTML = "Decrease"
  document.getElementById("dig_dec").classList.remove("limit-button")

  document.getElementById("inf_mb").classList.remove("invis")
  document.getElementById("inf_display").innerHTML = "You have " + game.d0 + "/0."

  refresh();








} // Is run when the player limits, undoes the invis-ing of 2 digits







function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}
