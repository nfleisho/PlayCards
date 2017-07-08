//constructor for hand object
function hand(crdarr) {
    this.cards = crdarr;
    this.hiCrdPts = function () {
        var hipt = 0;
        for (var cardind = 0; cardind < crdarr.length; cardind++) {
            var crdval = crdarr[cardind].valu;
            if (crdval in pointlist) hipt += pointlist[crdval];
        }
        return hipt;
    }
    this.lenPts = function () {
        var lenpts = 0;
        for (var jsuit = 0; jsuit < suitlist.length; jsuit++) {
            var suitsub = crdarr.filter(function (crds) {
                return crds.suit == suitlist[jsuit]
            });
            if (suitsub.length > 4) lenpts += (suitsub.length - 4);
        }
        return lenpts;
    }
    this.dist = function () {
        var suitdist = {};
        for (var jsuit = 0; jsuit < suitlist.length; jsuit++) {
            var suitsub = crdarr.filter(function (crds) {
                return crds.suit == suitlist[jsuit]
            });
            suitdist[suitlist[jsuit]] = suitsub.length;
        }
        return suitdist;
    }
    this.isBalanced = function () {
        var mult = 0;
        for (item in this.dist()) {
            if (this.dist()[item] < 2) return false;
            if (this.dist()[item] == 2) mult += 1;
        }
        if (mult > 1) return false;
        return true;
    }
    this.bidToOpen = function () {
        var totpts = this.hiCrdPts() + this.lenPts();
        if (totpts > 21) return "2 clubs";
        if (this.isBalanced() && this.hiCrdPts() > 19 && this.hiCrdPts() < 22) return "2 NT";
        if (this.isBalanced() && this.hiCrdPts() > 14 && this.hiCrdPts() < 18) return "1 NT";
        if (totpts >= 13 && this.dist().spades > 4) return "1 spade";
        if (totpts >= 13 && this.dist().hearts > 4) return "1 heart";
        if (totpts >= 13 && this.dist().diams > this.dist().clubs) return "1 diamond";
        if (totpts >= 13 && this.dist().clubs >= this.dist().diams) return "1 club";
        return "pass";
    }
    this.resp21NT = function () {
        var totpts = this.hiCrdPts() + this.lenPts();
        if (totpts > 9) {
            if (this.dist().spades > 5) {
                return "4 spades";
            } else if (this.dist().hearts > 5) {
                return "4 hearts";
            } else if (this.dist().spades == 5) {
                return "3 spades";
            } else if (this.dist().hearts == 5) {
                return "3 hearts";
            } else return "3 NT";
        }
        if (totpts < 10 && totpts > 7) {
            if (this.dist().spades > 4) {
                return "3 spades";
            } else if (this.dist().hearts > 4) {
                return "3 hearts";
            } else return "2 NT";
        }
        if (totpts < 8) {
            for (var suit in this.dist()) {
                if (this.dist()[suit] > 4) return "2 " + suit;
            }
            return "pass"
        }
    }
}
var btndex = 0;
var declar = 0;


var suitlist = ['clubs', 'diams', 'hearts', 'spades'].reverse();
var vallist = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].reverse();
var pointlist = {
    A: 4,
    K: 3,
    Q: 2,
    J: 1
};
var players = ["North", "East", "South", "West"];
//deck is object containing 52 cards and methods
var deck = {};
//table is set of dealt hands
var table = {};
//nudeck is sorted full deck. used as sorting reference for hands
var nudeck = nuDeck();
// cards is an array of card objects
deck.cards = [];
//creates ordered new deck
deck.create = function () {
    this.cards = [];
    for (var isuit = 0; isuit < suitlist.length; isuit++) {
        for (var ivals = 0; ivals < vallist.length; ivals++) {
            var card = {};
            card.suit = suitlist[isuit];
            card.valu = vallist[ivals];
            this.cards.push(card);
        }
    }
}
//randomizes deck (????)
deck.shuffle = function (shufmax) {
    if (!shufmax) shufmax = 5;
    for (jshuf = 0; jshuf < shufmax; jshuf++)
        this.cards.sort(function (a, b) {
            return (0.5 - Math.random())
        })
}

//deals deck into handsnum hands of handsize cards (default:4@13)
deck.deal = function (handsnum, handsize) {
    if (!handsnum) handsnum = 4;
    if (!handsize) handsize = this.cards.length / handsnum;
    var cardind = 0;
    for (var handind = 0; handind < handsnum; handind++)
        table["hand" + handind] = [];
    //deals cards out
    for (var sizind = 0; sizind < handsize; sizind++) {
        for (var handind = 0; handind < handsnum; handind++) {
            table["hand" + handind].push(this.cards[cardind]);
            cardind += 1;
        }
    }
    //sorts hands by suit and value
    for (var item in table) {
        table[item].sort(function (a, b) {
            var x = trakInd(nudeck, a);
            var y = trakInd(nudeck, b);
            if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
            return 0;
        });
    }
}
var declarer = new hand(table['hand' + declar]);
var partner = new hand(table['hand' + (declar + 2) % 4]);
//returns high card points in hand. hand is array of card objects.

//returns unshuffled deck. deck is array of 52 sorted card objects
function nuDeck() {
    var shuffNo = [];
    for (var isuit = 0; isuit < suitlist.length; isuit++) {
        for (var ivals = 0; ivals < vallist.length; ivals++) {
            var card = {};
            card.suit = suitlist[isuit];
            card.valu = vallist[ivals];
            shuffNo.push(card);
        }
    }
    return shuffNo;
}
//returns index in arrref of objin.  used to track index of card in nuDeck for sorting.
function trakInd(arrref, objin) {
    var refind = arrref.findIndex(function (item) {
        return (item.suit == objin.suit && item.valu == objin.valu)
    });
    return refind;
}

//returns string used to set up page display of hand both by text and icon. hand is an array of cards objects
function handDisplay(hand) {
    var dispstr = "";
    for (var jsuit = 0; jsuit < suitlist.length; jsuit++) {
        dispstr += "<strong>&" + suitlist[jsuit] + ";: </strong>";
        var suitsub = hand.filter(function (crds) {
            return crds.suit == suitlist[jsuit]
        });
        for (var kind = 0; kind < suitsub.length; kind++) {
            dispstr += suitsub[kind].valu + " ";
        }
        dispstr += "<br>";
    }
    return dispstr;
}

//called at page open. creates,shuffles,and deals cards. sets html display
function dealHand() {
    deck.create();
    deck.shuffle();
    deck.deal();
    for (var deal = 0; deal < 100; deal++) {
        deck.create();
        deck.shuffle();
        deck.deal();
        if (isNTOpen()) {
            var index = 0;
            for (var item in table) {
                var handdisp = handDisplay(table[item]);
                var divloc = "div" + index;
                $("#" + divloc).append(handdisp);
                index += 1
            };
            declar = parseInt(isNTOpen().slice(-1));
            break;
        };

    };
    bidNfade(0);
}
//tests to see if deal gives 1NT opener
function isNTOpen() {
    for (var item in table) {
        var tblhnd = new hand(table[item]);
        if (tblhnd.bidToOpen() == "1 NT") {
            return item;
        } else if (tblhnd.bidToOpen() != "1 NT" && tblhnd.bidToOpen() != "pass") {
            return false;
        }
    }
    return false;
}

// displays point info for hand
function $showPoints(crdarr) {
    var fochand = new hand(crdarr);
    var hidisp = fochand.hiCrdPts();
    var lendisp = fochand.lenPts();
    var $totdisp = $("<div class='ptzdisp'><em>hi crd pts = " + hidisp + "<br> length pts = " + lendisp + "</em></div>");
    return $totdisp;
}
//animates opening bid process on txt view page
function bidNfade(hndex, hndmax) {
    if (!hndmax) hndmax = 3;
    if (hndex > hndmax) return;
    var currplay = new hand(table['hand' + hndex]);
    var bidstr = "<h4 class='bids' style='color:green'>" + currplay.bidToOpen() + "</h4>";
    var divloc = "#div" + hndex;
    var bidloc = "#bid" + hndex;
    $(divloc).fadeTo(800, 0.2, function () {
        $(bidloc).html(bidstr);
    });
    $(divloc).fadeTo(800, 1.0, function () {
        if (currplay.bidToOpen() != "pass") {
            $("#div" + ((hndex + 5) % 4)).fadeTo("fast", 0.1);
            $("#div" + ((hndex + 3) % 4)).fadeTo("fast", 0.1);
            return;
        }
        bidNfade(hndex + 1)
    });
    return;
}
//animates and displays defender pass and parter's response bid
function respNfade(hndex) {
    if (hndex > 3) return;
    var defndex = (hndex + 1) % 4;
    var partndex = (hndex + 2) % 4;
    var partplay = new hand(table['hand' + partndex]);
    var bidstr = "<h4 class='bids' style='color:green'>pass </h4>";
    var divloc = "#div" + defndex;
    var bidloc = "#bid" + defndex;
    $(bidloc).append(bidstr);
    var bidstr = "<h4 class='bids' style='color:green'>" + partplay.resp21NT() + "</h4>";
    var divloc = "#div" + partndex;
    var bidloc = "#bid" + partndex;
    $(divloc).fadeTo(800, 0.2, function () {
        $(bidloc).append(bidstr);
        $(divloc).fadeTo(800, 1.0);
    });
    return;
}

// determines declarer rebid
function rebid(partbid) {
    var decplay = new hand(table['hand' + declar]);
    var totpts = decplay.hiCrdPts() + decplay.lenPts();
    if (partbid == "2 NT" && totpts == 15) return "pass";
    else if (partbid == "2 NT" && totpts > 15) return "3 NT";
    else if (partbid == "3 spades" && decplay.dist().spades > 2) return "4 spades";
    else if (partbid == "3 spades" && decplay.dist().spades < 3) return "3 NT";
    else if (partbid == "3 hearts" && decplay.dist().hearts > 2) return "4 hearts";
    else if (partbid == "3 hearts" && decplay.dist().hearts < 3) return "3 NT";
    //if partner passes, bidding is over
    else if (partbid == "pass") return "";
    else return "pass"
}
//animates and displays defender pass, declarer rebid and end of bidding
function rebidNfade() {
    var deflft = (declar + 1) % 4;
    var defrgt = (declar + 3) % 4;
    var part = (declar + 2) % 4;
    var partplay = new hand(table['hand' + part]);
    var partbid = partplay.resp21NT();
    var bidpasstr = "<h4 class='bids' style='color:green'>pass </h4>";
    var divloc1 = "#div" + defrgt;
    var bidloc1 = "#bid" + defrgt;
    $(bidloc1).append(bidpasstr);
    var bidstr = "<h4 class='bids' style='color:green'>" + rebid(partbid) + "</h4>";
    var divloc2 = "#div" + declar;
    var bidloc2 = "#bid" + declar;
    $(divloc2).fadeTo(800, 0.2, function () {
        $(bidloc2).append(bidstr)
    });
    $(divloc2).fadeTo(800, 1.0, function () {
        var divloc3 = "#div" + deflft;
        var bidloc3 = "#bid" + deflft;
        if (rebid(partbid) == "") return;
        else if (rebid(partbid) != "pass") {
            $(bidloc3).append(bidpasstr);
            var divloc4 = "#div" + part;
            var bidloc4 = "#bid" + part;
            $(bidloc4).append(bidpasstr);
            var divloc1 = "#div" + defrgt;
            var bidloc1 = "#bid" + defrgt;
            $(bidloc1).append(bidpasstr);
        } else $(bidloc3).append(bidpasstr);
    });
    return;
}


// below are functions used to feed statistics page.

//returns an array of percentage of hands dealt of points given by array index.
function NTdistData() {
    var distobj = {
        no2: 0,
        no5with2: 0,
        with5: 0
    };
    var totdistarr = [];
    var ind = 0;
    while (ind < 10000) {
        deck.create();
        deck.shuffle();
        deck.deal();
        if (isNTOpen()) {
            var NThnd = new hand(table[isNTOpen()]);
            var NTdist = NThnd.dist();
            var distarr = [];
            for (item in NTdist) distarr.push(NTdist[item]);
            if (distarr.indexOf(5) != -1) distobj.with5+= 1;
            else if ((distarr.indexOf(2) != -1)) distobj.no5with2 += 1;
            else distobj.no2 += 1;
            ind += 1
        };
    };
    for (item in distobj) totdistarr.push(distobj[item]);
    var totchk = totdistarr.reduce(function(a, b) {
        return a + b
    });
    var probobj = {};
    for (item in distobj) {
        probobj[item] = distobj[item] * 100 / totchk
    };
    console.log(totchk, probobj);
}
function NTptData() {
    var totptarr = [];
    for (var k=0; k<41; k++) totptarr[k] = 0;
    var ind = 0;
    while (ind < 5000) {
        deck.create();
        deck.shuffle();
        deck.deal();
        if (isNTOpen()) {
            var declarer = parseInt(isNTOpen().slice(-1));
            var partner = (declarer+2)%4;
            var NThnd = new hand(table[isNTOpen()]);
            var parthnd = new hand(table["hand"+partner]);
            var NTpts = NThnd.hiCrdPts()+parthnd.hiCrdPts()+NThnd.lenPts()+parthnd.lenPts();
            totptarr[NTpts]+=1;
            ind += 1
        };
    };
    var totchk = totptarr.reduce(function(a, b) {
        return a + b
    });
    var probptarr = [];
    for (var j=0; j< totptarr.length; j++) {
        probptarr[j] = totptarr[j] * 100 / totchk
    };
    return probptarr;
}

//working...
function bidData(maxhands, shuff) {
    var bidopenarr = [];
    var bidopenobj = {};
    var totop = 0
    for (var dlind = 0; dlind < maxhands; dlind++) {
        deck.create();
        deck.shuffle(shuff);
        deck.deal();
        for (var item in table) {

            var currplay = new hand(table[item]);
            var openbid = currplay.bidToOpen();
            if (openbid != "pass" && !(openbid in bidopenobj)) bidopenobj[openbid] = 1;
            else if (openbid in bidopenobj) bidopenobj[openbid] += 1;
        }
    }
    for (item in bidopenobj) totop += bidopenobj[item];
    for (item in bidopenobj) {
        var holdarr = [item, bidopenobj[item] * 100 / totop];
        bidopenarr.push(holdarr);
    }
    return bidopenarr.sort();
}

function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Points');
    data.addColumn('number', 'Percent of Partnerships');
    var ptdat = NTptData();
    var tothand = new DataArray(ptdat);
    $("#stattot").html('<ul class="list-group"><h3>Statistics - Total Partnership Points</h3><li class="list-group-item"> most likely: ' + tothand.mostlikely + '</li><li class="list-group-item">average: ' + tothand.aver() + '</li><li class="list-group-item"> standard dev: ' + tothand.stddev() + '</li></ul>')
    var holddata = [];
    for (var ind = 0; ind < ptdat.length; ind++) {
        var mordata = [ind, ptdat[ind]];
        holddata.push(mordata)
    };
    data.addRows(holddata);


    // Set chart options
    var options = {
        title: '1 NT Partnerships by Points',
        //'width':80%,
        height: 400,
        hAxis: {
            title: 'Points',
            ticks: [0, 5, 10, 15, 20, 25, 30, 35]
        },
        vAxis: {
            title: 'Percent dealt'
        },
        legend: {
            position: 'bottom'
        }
        //bar: {groupWidth:'10%'}
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('hidiv'));
    chart.draw(data, options);
}

function drawPiChart() {
    // Create the data table.
    var maxhands = 5000;
    var shuffmax = 3;
    //var maxhands = $("#dealsnum").val();
    //var shuffmax = $("#shuff").val();
    var ptdat = pointData(maxhands, shuffmax);
    var hcarrdat = ptdat[0];
    var totarrdat = ptdat[1];
    var hihand = new DataArray(hcarrdat);
    var tothand = new DataArray(totarrdat);
    $("#stattot").html('<ul class="list-group"><li class="list-group-item"> % probability to open: ' + tothand.gtpts(13) + '</li></ul>')
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Bid');
    data.addColumn('number', 'Opening Bids');
    var biddat = bidData(maxhands, shuffmax);
    data.addRows(biddat);

    // Set chart options
    var options = {
        title: 'Strong Opening Bids',
        //width:400,
        height: 300,
        is3D: true,
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('hidiv'));
    chart.draw(data, options);
}

function drawCharts() {
    drawChart();
    drawPiChart();
}

// statistics on array of numbers
function DataArray(datarr) {
    this.data = datarr;
    this.maxval = datarr.reduce(function (a, b) {
        return Math.max(a, b)
    });
    this.mostlikely = datarr.indexOf(this.maxval);
    this.summ = datarr.reduce(function (a, b) {
        return (a + b)
    });
    this.aver = function () {
        var runsum = 0;
        for (var j = 0; j < datarr.length; j++) runsum += j * datarr[j] / this.summ;
        return runsum.toFixed(2);
    }
    this.gtpts = function (pts) {
        var runsum = 0;
        for (var j = pts; j < datarr.length; j++) runsum += datarr[j] * 100 / this.summ;
        return runsum.toFixed(2);
    }
    this.stddev = function () {
        var runsum = 0;
        for (var j = 0; j < datarr.length; j++) runsum += datarr[j] * Math.pow((j - this.aver()), 2) / this.summ;
        return Math.sqrt(runsum).toFixed(2);
    }
    this.norm = function () {
        var normarr = datarr;
        var arrsumm = this.summ;
        for (i = 0; i < datarr.length; i++) normarr[i] = datarr[i] / arrsumm;
        normarr.push(arrsumm);
        return normarr;

    }
}
//creates an array whose first index is the total team number of cards of a suit and second index number of cards for one player.
function suitDist(maxhands, shuff) {
    var distarr = new Array(14);
    for (var i = 0; i < distarr.length; i++) distarr[i] = new Array(14).fill(0);
    for (var dlind = 0; dlind < maxhands; dlind++) {
        deck.create();
        deck.shuffle(shuff);
        deck.deal();

        for (var team = 0; team < 2; team++) {
            var playerOne = new hand(table["hand" + team]);
            var playerTwo = new hand(table["hand" + (team + 2)]);
            for (var item in playerOne.dist()) {
                var suittot = playerOne.dist()[item] + playerTwo.dist()[item];
                distarr[suittot][playerOne.dist()[item]] += 1;
            }
        }
    }
    return distarr;
}
//working
function makeTableRow(rwarr) {
    var nuRow = document.createElement("tr");
    for (var i = 0; i < rwarr.length; i++) {
        var nuEntry = document.createElement("td");
        var nuData = document.createTextNode(rwarr[i]);
        nuEntry.appendChild(nuData);
        nuRow.appendChild(nuEntry);
    }
    return nuRow

}

function fillDistTable() {
    var datEnt = document.getElementById("gendat");
    datEnt.innerHTML = "";
    var maxhands = $("#dealsnum").val();
    var shuffmax = $("#shuff").val();
    var distData = suitDist(maxhands, shuffmax);
    //var dataDisp = distData;
    for (var i = 0; i < distData.length; i++) {
        var sampSum = distData[i].reduce(function (a, b) {
            return (a + b)
        });
        for (j = 0; j < distData[i].length; j++) {
            if (sampSum) {
                distData[i][j] /= sampSum;
                distData[i][j] = Math.round(distData[i][j] * 100);
            }
        }
        distData[i].push(sampSum);
        distData[i].unshift(i);
        var rwAdd = makeTableRow(distData[i]);
        datEnt.appendChild(rwAdd);
    }
    return;
}
