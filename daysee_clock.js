var Clock = /** @class */ (function () {
    //endregion -------------------------------------------------------------------------------------- Global configuration
    function Clock(settings, daysee) {
        this.trace = true;
        this.isChrome = !!window.chrome && !!window.chrome.webstore && !window.isOpera;
        this.__SECOND = 1000;
        this.__MINUTE = this.__SECOND * 60;
        this.__5_MINUTES = this.__MINUTE * 5;
        this.__10_MINUTES = this.__MINUTE * 10;
        this.__15_MINUTES = this.__MINUTE * 15;
        this.__30_MINUTES = this.__MINUTE * 30;
        this.__HOUR = this.__MINUTE * 60;
        this.daypartsLocale = {
            /*  english */ "en": "evening,afternoon,morning,night",
            /*  spanish */ "es": "noche,tarde,mañana,noche",
            /*   french */ "fr": "soir,l'après-midi,le matin,la nuit",
            /*    dutch */ "nl": "avond,middag,ochtend,nacht",
            /*   german */ "de": "Abend,Nachmittag,Morgen,Nacht",
            /*   danish */ "da": "aften,eftermiddag,morgen,aften",
            /*  italian */ "it": "sera,pomeriggio,mattina,sera",
            /* portuges */ "pt": "Noite,tarde,manhã,noite" // todo needs different syntax?
        };
        var thisClock = this;
        thisClock.daysee = daysee;
        thisClock.browser_language = navigator.language.split('-')[0];
        thisClock.clock_language = settings ? settings.clock_language || thisClock.browser_language : thisClock.browser_language;
        thisClock.clock_letterColor = settings ? settings.clock_letterColor || 'wheat' : 'wheat';
        thisClock.clock_faceColor = settings ? settings.clock_faceColor || 'black' : 'black';
        thisClock.clock_letterBorder = thisClock.clock_letterColor;
        thisClock.clock_handColor = thisClock.clock_letterColor;
        thisClock.clock_handBorder = thisClock.clock_faceColor;
        thisClock.day_backgroundColor = thisClock.clock_faceColor;
        thisClock.day_textColor = thisClock.clock_letterColor;
        thisClock.digital_textColor = thisClock.clock_letterColor;
        thisClock.digital_backgroundColor = thisClock.clock_faceColor;
        thisClock.digital_opacity = 0.7;
        thisClock.displayAnalog = true;
        thisClock.displayDigital = false;
        thisClock.displayDigitalSeconds = false;
        thisClock.displaySeconds = false;
        thisClock.display24hours = false; // display time on the analog clock in 1 - 24 hour notation
        thisClock.clockTestDate = false;
        thisClock.clock_faceColor = 'black';
        thisClock.clock_letterBorderThinkness = 3;
        thisClock.operatingSecondsCounter = 0; // count seconds
        thisClock.reloadAfterXseconds = 360; // 60 seconds X 60 minutes = 1 hour
        thisClock.clockHands = {
            "hour": {
                length: .4,
                width: .125,
                border: thisClock.clock_handBorder,
                fill: thisClock.clock_handColor
            },
            "minute": {
                length: .67,
                width: .1,
                border: thisClock.clock_handBorder,
                fill: thisClock.clock_handColor
            },
            "second": {
                length: .65,
                width: .01,
                border: "transparent",
                fill: "grey"
            }
        };
        Object.assign(thisClock, settings);
        if (settings.container) {
            if (!(settings.container instanceof HTMLCanvasElement)) {
                // append a CANVAS element in the specified container if there is none
                var canvas = document.createElement('CANVAS');
                var id = settings.container.replace('#', '') + '_ClockCanvas';
                canvas.id = id;
                thisClock.containerElement = document.querySelector(settings.container);
                thisClock.containerElement.appendChild(canvas);
                settings.container = '#' + id;
            }
            else {
                thisClock.containerElement = document.querySelector(settings.container).parentNode;
            }
            thisClock.canvasDOMelement = document.querySelector(settings.container);
            thisClock.ctx = thisClock.canvasDOMelement.getContext("2d");
            thisClock.drawCanvasContainer();
            thisClock.disableTraceAfter30seconds();
        }
        else {
            throw "Missing container property";
        }
    }
    Clock.prototype.disableTraceAfter30seconds = function () {
        var thisClock = this;
        window.setTimeout(function () {
            thisClock.trace = false;
            thisClock.redrawScreen();
        }, 1000 * 5);
    };
    //noinspection JSUnusedGlobalSymbols
    Clock.prototype.setLanguage = function (newLanguage) {
        var thisClock = this;
        thisClock.initCurrentDateAndTime(newLanguage);
        thisClock.drawCanvasContainer();
    };
    Clock.prototype.redrawScreen = function () {
        var thisClock = this;
        if (thisClock.clockInterval_Seconds)
            clearInterval(thisClock.clockInterval_Seconds);
        if (thisClock.clockInterval_Minutes)
            clearInterval(thisClock.clockInterval_Minutes);
        if (thisClock.clockInterval_Hours)
            clearInterval(thisClock.clockInterval_Hours);
        thisClock.drawCanvasContainer();
    };
    Clock.prototype.initCurrentDateAndTime = function (newLanguage) {
        var thisClock = this;
        if (newLanguage)
            console.info('reset clock language:', newLanguage);
        thisClock.clock_language = thisClock.clock_language || newLanguage;
        if (!thisClock.daypartsLocale.hasOwnProperty(thisClock.clock_language))
            thisClock.clock_language = 'nl'; // default language when no language is found
        thisClock.dayparts = thisClock.daypartsLocale[thisClock.clock_language]; // Array with day part name based on clock_language: ['evening','afternoon','morning','night']
        thisClock.clockDate = thisClock.clockTestDate ? new Date(String(thisClock.clockTestDate)) : new Date();
        thisClock.clockfullHours = thisClock.clockDate.getHours();
        thisClock.clockMinutes = thisClock.clockDate.getMinutes();
        thisClock.clockSeconds = thisClock.clockDate.getSeconds();
        thisClock.clockHours = thisClock.clockfullHours % 12; // 1 to 11
        thisClock.strDate_weekday = thisClock.clockDate.toLocaleDateString(thisClock.clock_language, { weekday: 'long' }); // short for abbreviated notation
        thisClock.strDate_daypart = thisClock.dayparts.split(',')[thisClock.clockfullHours > 17 ? 0 : thisClock.clockfullHours > 11 ? 1 : thisClock.clockfullHours > 5 ? 2 : 3]; //0=evening,1=night,2=morning,3=afternoon
        // get language date notation
        thisClock.strDate_DMY = thisClock.clockDate.toLocaleDateString(thisClock.clock_language, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    //region ------------------------------------------------------------------------------------- ### canvas draw functions
    Clock.prototype.fontSize = function (n) {
        var thisClock = this;
        thisClock.ctx.font = Math.floor(n) + "px arial";
        //thisClock.ctx.font = Math.floor(n) + "px Verdana, sans-serif";
    };
    Clock.prototype.clear_Canvas = function () {
        // this.ctx.fillStyle = "#ff0000";
        // this.ctx.fillRect(10, 10, 100, 100);
        //0,0 is top,left
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    };
    Clock.prototype.drawLine = function (x1, y1, x2, y2, width, color) {
        var ctx = this.ctx;
        ctx.lineWidth = width || 2;
        ctx.strokeStyle = color || 'red';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };
    Clock.prototype.drawHline = function (y, color, width) {
        this.drawLine(-100, y, 100, y, width, color);
    };
    Clock.prototype.drawRect = function (x1, y1, x2, y2, color) {
        var ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1, x2, y2);
    };
    Clock.prototype.drawClockHand = function (handoptions, direction, radius) {
        var handwidth = radius * handoptions.width;
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(0, 0); // move to center of clock
        ctx.lineWidth = handwidth;
        ctx.strokeStyle = handoptions.border;
        ctx.lineCap = "round";
        ctx.rotate(direction); // rotate in the (seconds) direction
        ctx.lineTo(0, -radius * handoptions.length); // draw a line with length
        ctx.stroke();
        ctx.rotate(-direction); //back to 0,0 origin     // return to center of clock
        ctx.lineWidth = handwidth * .8; // smaller width
        ctx.strokeStyle = handoptions.fill; // stroke inner color
        ctx.stroke();
    };
    Clock.prototype.drawText = function (txt, x, y, fontsize, maxfontsize, fittowidth, cleanwidth, backgroundColor, textColor, opacity) {
        var thisClock = this;
        var ctx = thisClock.ctx;
        thisClock.fontSize(fontsize);
        if (fittowidth) {
            fontsize = 200;
            do {
                thisClock.fontSize(--fontsize);
            } while (ctx.measureText(txt).width > fittowidth);
            if (maxfontsize) {
                do {
                    thisClock.fontSize(--fontsize);
                } while (fontsize > maxfontsize);
            }
        }
        while ((x + ctx.measureText(txt).width / 2) > thisClock.canvasWidth / 2) {
            --x;
        }
        do {
            y--;
        } while (y > thisClock.canvasHalfHeight - fontsize / 1.5);
        var cleanheight = fontsize;
        thisClock.drawRect(// clean area where text is drawn
        /** x1 */ x - (cleanwidth / 2), 
        /** y1 */ y - (cleanheight / 2) + (cleanheight / 10), 
        /** x2 */ cleanwidth, 
        /** y2 */ cleanheight, 
        /** color */ backgroundColor || thisClock.day_backgroundColor);
        if (opacity)
            ctx.globalAlpha = opacity;
        ctx.fillStyle = textColor || thisClock.day_textColor; // draw text
        thisClock.fontSize(fontsize);
        ctx.fillText(txt, x, y);
        thisClock.ctx.globalAlpha = 1; //restore opacity
        return {
            "x": x,
            "y": y,
            "fontsize": fontsize,
            "top": y - fontsize / 2,
            "bottom": y + fontsize / 2,
            "height": (y - fontsize / 2) - (y + fontsize / 2),
            "width": ctx.measureText(txt).width
        };
    };
    Clock.prototype.drawClockDebugInfo = function () {
        var thisClock = this;
        var clockTop = thisClock.clockTop;
        var clockBottom = thisClock.clockBottom;
        var canvasWidth = thisClock.canvasWidth;
        var canvasHeight = thisClock.canvasHeight;
        var canvasHalfHeight = thisClock.canvasHalfHeight;
        var dateFontSize = thisClock.dateFontSize;
        thisClock.drawHline(clockTop);
        thisClock.drawHline(0, 'green');
        thisClock.drawHline(clockBottom);
        thisClock.drawHline(thisClock.clockOffset_Y, 'lightgreen');
        thisClock.drawLine(0, clockTop, 0, clockBottom, 4, 'orange');
        var canvasPercentage = Math.floor((canvasWidth / canvasHeight));
        var info = canvasWidth + ' x ' + canvasHeight
            + ' %' + canvasPercentage
            + ' '
            //                                + '  s: ' + screen.availWidth + ' x ' + screen.availHeight
            //                                + '  c: ' + thisClock.clockHeight + ' x ' + thisClock.clockRadius + ' (' + clockTop + ' / ' + clockBottom
            + dateFontSize
            + '  d: ' + -canvasHalfHeight + ' x ' + canvasHalfHeight;
        thisClock.drawText(info
        /*          X */ , 0
        /*          Y */ , canvasHalfHeight - 7
        /*   fontsize */ , 10
        /* fittowidth */ , false);
    };
    Clock.prototype.drawRotatingFlowerSeconds = function () {
        var thisClock = this;
        var ctx = thisClock.ctx;
        /* Draw Daisy Flower image in center of clock and rotate in seconds */
        var clockHandDirection = (thisClock.clockSeconds * Math.PI / 30);
        ctx.rotate(clockHandDirection);
        var motionHeartbeat = 100; //optional flower pulsating
        var x = thisClock.clockHands.minute.width * thisClock.clockRadius * (motionHeartbeat / 100);
        ctx.drawImage(thisClock.centerIMG, -x / 2, -x / 2, x, x);
        ctx.rotate(-clockHandDirection);
    };
    //endregion --------------------------------------------------------------------------------------  canvas draw functions
    Clock.prototype.drawCanvasContainer = function () {
        var thisClock = this;
        var container = thisClock.containerElement.getBoundingClientRect();
        var ctx = thisClock.ctx;
        thisClock.canvasWidth = Math.floor(container.width);
        thisClock.canvasHeight = Math.floor(container.height);
        //console.info('clock width/height:', thisClock.canvasWidth, thisClock.canvasHeight);
        thisClock.isPortrait = thisClock.canvasWidth < thisClock.canvasHeight;
        thisClock.canvasHalfWidth = Math.floor(thisClock.canvasWidth / 2);
        thisClock.canvasHalfHeight = Math.floor(thisClock.canvasHeight / 2);
        thisClock.canvasDOMelement.width = thisClock.canvasWidth;
        thisClock.canvasDOMelement.height = thisClock.canvasHeight;
        thisClock.ctx.setTransform(1, 0, 0, 1, 0, 0);
        var textData = {
            day: {
                "x": 0,
                "y": 0,
                "fontsize": 0,
                "top": 0,
                "bottom": 0,
                "height": 0,
                "width": 0
            },
            date: {
                "x": 0,
                "y": 0,
                "fontsize": 0,
                "top": 0,
                "bottom": 0,
                "height": 0,
                "width": 0
            },
            daypart: {
                "x": 0,
                "y": 0,
                "fontsize": 0,
                "top": 0,
                "bottom": 0,
                "height": 0,
                "width": 0
            },
            digital: {
                "x": 0,
                "y": 0,
                "fontsize": 0,
                "top": 0,
                "bottom": 0,
                "height": 0,
                "width": 0
            }
        };
        //region ------------------------------------------------------------------------------------- ### drawAnalogClock
        // display Analog clock RELATIVE to the 0,0 Canvas origin
        function drawAnalogClock(clockOffset_X, clockOffset_Y, clockRadius) {
            function drawAnalogClockFace() {
                var ctx = thisClock.ctx;
                /* The whole clock needs to be redrawn to wipe out the previous CANVAS content */
                ctx.beginPath();
                ctx.arc(0, 0, clockRadius, 0, Math.floor(2 * Math.PI));
                ctx.fillStyle = thisClock.clock_faceColor;
                //ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
                ctx.fill();
            }
            function drawAnalogClockNumbers() {
                var ctx = thisClock.ctx;
                ctx.fillStyle = thisClock.clock_letterColor;
                ctx.strokeStyle = thisClock.clock_letterBorder;
                ctx.lineWidth = thisClock.clock_letterBorderThinkness;
                for (var nmbr = 1; nmbr < 13; nmbr++) {
                    var numberSize = (nmbr % 3 === 0) ? .3 : 0.2; // scale numbers,  3 6 9 12 are displayed bigger
                    var numberStr = nmbr;
                    if (thisClock.display24hours && thisClock.clockfullHours > 11) {
                        numberStr += 12;
                        numberSize *= .7; // 24 hour clock numbers are displayed smaller
                    }
                    if (nmbr === 12)
                        thisClock.numberfontSize = clockRadius * numberSize;
                    thisClock.fontSize(clockRadius * numberSize);
                    var angle = nmbr * Math.PI / 6; // angle from 0,0 clock origin
                    var numberoffset = clockRadius * 0.85; // draw number inside clock face
                    ctx.rotate(angle); // move to number position
                    ctx.translate(0, -numberoffset); // set origin to center of Number
                    ctx.rotate(-angle); // move drawing position upright again
                    ctx.strokeText(numberStr.toString(), 0, 0); // draw outline
                    ctx.fillText(numberStr.toString(), 0, 0); // draw fill
                    ctx.rotate(angle); // rotate back to 0,0 clock origin
                    ctx.translate(0, numberoffset); // set origin to center of clock
                    ctx.rotate(-angle); // stroke is upright again
                }
            }
            function drawAnalogClockHands() {
                var _hours = thisClock.clockHours;
                var _minutes = thisClock.clockMinutes;
                var _seconds = thisClock.clockSeconds;
                var clockHandDirection = (_hours * Math.PI / 6) + (_minutes * Math.PI / (6 * 60)) + (_seconds * Math.PI / (360 * 60));
                thisClock.drawClockHand(thisClock.clockHands.hour, clockHandDirection, clockRadius);
                clockHandDirection = (_minutes * Math.PI / 30) + (_seconds * Math.PI / (30 * 60));
                thisClock.drawClockHand(thisClock.clockHands.minute, clockHandDirection, clockRadius);
                clockHandDirection = (_seconds * Math.PI / 30);
                thisClock.displaySeconds = thisClock.daysee.setting('displaySeconds');
                if (thisClock.displaySeconds)
                    thisClock.drawClockHand(thisClock.clockHands.second, clockHandDirection, clockRadius);
                if (thisClock.centerIMG)
                    thisClock.drawRotatingFlowerSeconds();
            }
            thisClock.ctx.translate(clockOffset_X, clockOffset_Y); // move 0,0 point of canvas to center of clock
            drawAnalogClockFace();
            drawAnalogClockNumbers();
            drawAnalogClockHands();
            thisClock.ctx.translate(-clockOffset_X, -clockOffset_Y); // move 0,0 back to non-clock center (screen)
            if (thisClock.trace)
                thisClock.drawClockDebugInfo();
        }
        //endregion ---------------------------------------------------------------------------------- ### drawAnalogClock
        function drawClock_Portrait() {
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            var strDate_DMY = thisClock.strDate_DMY;
            while (strDate_DMY.length < 10) {
                strDate_DMY = ' ' + strDate_DMY + ' ';
            }
            textData.date =
                thisClock.drawText(// Date (bottom)
                /**       text */ strDate_DMY, 
                /**          X */ 0, 
                /**          Y */ thisClock.canvasHalfHeight, 
                /**   fontsize */ 10, 
                /**maxfontsize */ thisClock.canvasHeight / 10, 
                /** fittowidth */ thisClock.canvasWidth, 
                /** cleanwidth */ thisClock.canvasWidth);
            var dateFontSize = textData.date.fontsize;
            thisClock.clockBottom = Math.floor(textData.date.y - dateFontSize / 2); // bottom of clock is top of text
            var dateTextPosition_Y = Math.floor(-thisClock.canvasHalfHeight + dateFontSize / 2);
            textData.day = thisClock.drawText(// Dayname (top)
            /**       text */ thisClock.strDate_weekday, 
            /**          X */ 0, 
            /**          Y */ dateTextPosition_Y, 
            /**   fontsize */ dateFontSize, 
            /**maxfontsize */ dateFontSize, 
            /** fittowidth */ thisClock.canvasWidth, 
            /** cleanwidth */ thisClock.canvasWidth);
            dateFontSize = textData.day.fontsize;
            dateTextPosition_Y = dateTextPosition_Y + 10 + dateFontSize; // below dayname
            textData.daypart = thisClock.drawText(// daypart
            /**       text */ thisClock.strDate_daypart, 
            /**          X */ 0, 
            /**          Y */ dateTextPosition_Y, 
            /**   fontsize */ dateFontSize, 
            /**maxfontsize */ dateFontSize, 
            /** fittowidth */ false, 
            /** cleanwidth */ thisClock.canvasWidth);
            dateFontSize = textData.daypart.fontsize;
            if (thisClock.displayDigital) {
                dateTextPosition_Y = dateTextPosition_Y + 10 + dateFontSize; // below dayname
                thisClock.clockOffset_Y += dateFontSize / 2;
                thisClock.clockRadius -= dateFontSize / 2;
                textData.digital = drawDigitalClock(
                /**          X */ thisClock.clockOffset_X, 
                /**          Y */ textData.daypart.bottom + dateFontSize / 2, 
                /**   fontsize */ dateFontSize, 
                /**maxfontsize */ dateFontSize, 
                /** fittowidth */ thisClock.canvasWidth, 
                /** cleanwidth */ thisClock.canvasWidth, 
                /** background */ thisClock.digital_backgroundColor, 
                /**  textcolor */ thisClock.digital_textColor);
            }
            thisClock.clockTop = Math.floor(dateTextPosition_Y + dateFontSize / 2);
            thisClock.clockHeight = Math.floor(thisClock.clockBottom - thisClock.clockTop); //clockTop is negative
            thisClock.clockRadius = Math.floor(thisClock.clockHeight / 2);
            if (thisClock.clockHeight > thisClock.canvasWidth)
                thisClock.clockRadius = thisClock.canvasHalfWidth;
            thisClock.clockOffset_X = 0; // position clock centered between text
            thisClock.clockOffset_Y = Math.floor((thisClock.clockBottom + thisClock.clockTop) / 2); // clockTop is negative
        } //drawClock_Portrait
        function drawClock_Landscape() {
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            var dateTextPosition_X = thisClock.canvasWidth / 4;
            textData.date =
                thisClock.drawText(// Date (right-bottom)
                /**       text */ thisClock.strDate_DMY, 
                /**          X */ dateTextPosition_X, 
                /**          Y */ thisClock.canvasHalfHeight, 
                /**   fontsize */ 0, 
                /**maxfontsize */ thisClock.canvasHeight / 4, 
                /** fittowidth */ thisClock.canvasHalfWidth, 
                /** cleanwidth */ thisClock.canvasHalfWidth);
            var dateFontSize = textData.date.fontsize;
            var dateTextPosition_Y = Math.floor(-thisClock.canvasHalfHeight + dateFontSize / 2) + 10;
            textData.day = thisClock.drawText(// Day right-top
            /**       text */ thisClock.strDate_weekday, 
            /**          X */ dateTextPosition_X, 
            /**          Y */ dateTextPosition_Y, 
            /**   fontsize */ dateFontSize, 
            /**maxfontsize */ dateFontSize * 1.5, 
            /** fittowidth */ thisClock.canvasHalfWidth, 
            /** cleanwidth */ thisClock.canvasHalfWidth);
            dateFontSize = textData.day.fontsize;
            dateTextPosition_Y = dateTextPosition_Y + 10 + dateFontSize;
            textData.daypart = thisClock.drawText(// Daypart (below day)
            /**       text */ thisClock.strDate_daypart, 
            /**          X */ dateTextPosition_X, 
            /**          Y */ dateTextPosition_Y, 
            /**   fontsize */ dateFontSize, 
            /**maxfontsize */ dateFontSize, 
            /** fittowidth */ thisClock.canvasHalfWidth, 
            /** cleanwidth */ thisClock.canvasHalfWidth);
            var digitalY = textData.day.y;
            if (thisClock.displayDigital) {
                var fontsize = textData.day.fontsize;
                textData.digital = drawDigitalClock(
                /**          X */ thisClock.clockOffset_X, 
                /**          Y */ digitalY, 
                /**   fontsize */ fontsize, 
                /**maxfontsize */ fontsize * .6, 
                /** fittowidth */ thisClock.canvasHalfWidth, 
                /** cleanwidth */ thisClock.canvasHalfWidth, 
                /** background */ thisClock.digital_backgroundColor, 
                /**  textcolor */ thisClock.digital_textColor);
                thisClock.clockHeight = thisClock.canvasHeight;
            }
            else {
                thisClock.clockHeight = thisClock.canvasHeight;
            }
            function calculateClockRadius() {
                if (thisClock.clockHeight > thisClock.canvasHalfWidth) {
                    thisClock.clockRadius = Math.floor(thisClock.canvasWidth / 4);
                }
                else {
                    thisClock.clockRadius = Math.floor(thisClock.clockHeight / 2);
                }
            }
            calculateClockRadius();
            thisClock.clockTop = -thisClock.clockRadius;
            thisClock.clockBottom = thisClock.clockRadius;
            thisClock.clockOffset_X = -dateTextPosition_X; // move clock from screen center to the left half
            thisClock.clockOffset_Y = 0;
            if (thisClock.displayDigital) {
                //thisClock.clockOffset_Y -= textData.digital.bottom / 2;
                calculateClockRadius();
            }
        } //drawClock_Landscape
        function drawDigitalClock(x, y, fontsize, maxfontsize, fittowidth, cleanwidth, backgroundColor, textColor) {
            function clockdigits(n) {
                n = String(n);
                if (n.length === 1)
                    n = '0' + n;
                return n;
                //padStart method defined in daysee_controller:
                //return String(n).padStart(2, '0');
            }
            var digitalTime = clockdigits(thisClock.clockfullHours) + ':' + clockdigits(thisClock.clockMinutes);
            if (thisClock.displayDigitalSeconds)
                digitalTime += ':' + clockdigits(thisClock.clockSeconds);
            return thisClock.drawText(
            ///**       text */ thisClock.clockDate.toLocaleTimeString(),
            /**       text */ digitalTime, 
            /**          X */ x, 
            /**          Y */ y, 
            /**   fontsize */ fontsize, 
            /**maxfontsize */ maxfontsize, 
            /** fittowidth */ fittowidth, 
            /** cleanwidth */ cleanwidth, 
            /** background */ backgroundColor, 
            /**  textcolor */ textColor, 
            /**    opacity */ thisClock.digital_opacity);
        } //drawDigitalClock
        function setClockIntervals() {
            thisClock.clockInterval_Seconds = window.setInterval(function () {
                updateClockAndDate(true, thisClock.displayDigital, false);
                var _operatingSeconds = thisClock.operatingSecondsCounter++;
                var _reloadSeconds = thisClock.reloadAfterXseconds;
                var _doHTMLreload = _reloadSeconds && (_reloadSeconds === _operatingSeconds);
                if (_doHTMLreload) {
                    this.daysee.log('reloadWebPage', thisClock.operatingSecondsCounter, thisClock.reloadAfterXseconds);
                    //this.daysee.reloadWebPage(0);
                    thisClock.operatingSecondsCounter = 1;
                }
                // hide buttons after n seconds
                if (thisClock.daysee.showingDaySeeControls && _operatingSeconds === 60) {
                    thisClock.daysee.showDaySeeControls(false);
                }
            }, thisClock.__SECOND);
            thisClock.clockInterval_Minutes = window.setInterval(function () {
                thisClock.clear_Canvas();
                updateClockAndDate(true, true, false);
            }, thisClock.__MINUTE);
            thisClock.clockInterval_Hours = window.setInterval(function () {
                updateClockAndDate(true, true, true);
                console.log('hourly');
            }, thisClock.__HOUR);
        } //setClockIntervals
        function drawTraceInformation() {
            if (thisClock.trace) {
                thisClock.drawText(
                /**       text */ thisClock.operatingSecondsCounter, 
                /**          X */ 10, 
                /**          Y */ 10, 
                /**   fontsize */ 20, 
                /**maxfontsize */ 30, 
                /** fittowidth */ 20, 
                /** cleanwidth */ 20);
            }
        }
        updateClockAndDate(true, true, true); // first init with seconds/minutes/hours
        setClockIntervals();
        //noinspection JSUnusedLocalSymbols
        function updateClockAndDate(newSecond, newMinute, newHour) {
            ctx.translate(thisClock.canvasHalfWidth, thisClock.canvasHalfHeight); //canvas origin 0,0 is center of screen
            thisClock.initCurrentDateAndTime();
            if (newSecond) {
                //if (newMinute) {
                if (thisClock.isPortrait) {
                    drawClock_Portrait();
                }
                else {
                    drawClock_Landscape();
                }
            }
            //if (newHour);// each hour, not every whole hour!
            drawAnalogClock(thisClock.clockOffset_X, thisClock.clockOffset_Y, thisClock.clockRadius);
            if (thisClock.isPortrait) {
            }
            else {
                if (thisClock.displayDigital) {
                    var dateFontSize = thisClock.numberfontSize;
                    textData.digital = drawDigitalClock(
                    /**          X */ thisClock.clockOffset_X, 
                    /**          Y */ textData.digital.y, 
                    /**   fontsize */ dateFontSize, 
                    /**maxfontsize */ dateFontSize, 
                    /** fittowidth */ thisClock.canvasHalfWidth, 
                    /** cleanwidth */ thisClock.canvasHalfWidth, 
                    /** background */ thisClock.digital_backgroundColor, 
                    /**  textcolor */ thisClock.digital_textColor);
                }
            }
            drawTraceInformation();
            ctx.translate(-thisClock.canvasHalfWidth, -thisClock.canvasHalfHeight); //canvas origin 0,0 is center of screen
        }
    };
    return Clock;
}());
