var MemoryCard = /** @class */ (function () {
    function MemoryCard(div) {
        var _this = this;
        this.div = div;
        this.name = div.getAttribute('word');
        this.hidden = false;
        this.div.addEventListener('click', function (event) {
            event.stopPropagation();
            _this.sayName();
        });
    }
    MemoryCard.prototype.sayName = function () {
        return assistent.say(this.name);
    };
    MemoryCard.prototype.reveal = function () {
        this.hidden = false;
        this.div.style.backgroundColor = 'green';
    };
    MemoryCard.prototype.hide = function () {
        var _this = this;
        window.setTimeout(function () {
            _this.div.style.opacity = .2;
            _this.hidden = true;
        }, 1);
    };
    MemoryCard.prototype.getName = function () {
        return this.name;
    };
    return MemoryCard;
}());
var MemoryTrainer = /** @class */ (function () {
    function MemoryTrainer() {
        var _this = this;
        var cards = this.cards = [];
        var divs = document.querySelectorAll("#fruits .fruit").slice();
        var objectNames = divs.map(function (div) {
            var memoryObject = new MemoryCard(div);
            cards.push(memoryObject);
            var fruitname = memoryObject.getName();
            return fruitname;
        });
        var getcard = function (i) { return _this.cards[i]; };
        var getcardByName = function (n) { return _this.cards.find(function (c) { return c.getName() === n; }); };
        var cardname = function (c) { return c.getName(); };
        var cardnames = function (s) { return s.map(cardname); };
        var saycardname = function (c) { return c.sayName(); };
        var hidecard = function (c) { return c.hide(); };
        var saycardthenhide = function (c) { return saycardname(c).then(function () { return hidecard(c); }); };
        var listcardnames = function (s) { return s.map(saycardthenhide); };
        var startgame = function (s) {
            //listcardnames(s);
            console.info(cardnames(s));
            s.map(function (c) {
                console.log(c);
                assistent.addCommand([cardname(c)], function (a) {
                    console.info('command', a);
                    console.info('this', this);
                    var card = this;
                    assistent.say("Onthoud de ").then(saycardthenhide(card));
                }.bind(c));
            });
            //                artyom.addCommands([{
            //                    indexes: cardnames(s),
            //                    action: (i) => {
            //                        let card = getcard(i);
            //                        console.info(card);
            //                        assistent.say("Onthoud de ").then(saycardthenhide(card));
            //
            //                    }
            //                }
            //                ]);
        };
        assistent.say("Onthoud deze " + cards.length + " fruitsoorten!").then(startgame(cards));
    }
    return MemoryTrainer;
}());
