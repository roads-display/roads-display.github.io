var __SWITCH_TO_FULLSCREEN_AFTER_X_MINUTES = 50000;
var __canvas_backgroundColor = 'black';
var __COMMAND_clockcanvas = 'clockcanvas';
var DOMUtils = /** @class */ (function () {
    function DOMUtils() {
        this.element = function (id) { return document.getElementById(id); };
    }
    DOMUtils.prototype.visibility = function (selector, show) {
        var element = document.querySelector(selector);
        if (element)
            element.style.visibility = show ? 'visible' : 'hidden';
    };
    DOMUtils.prototype.addEventListeners = function (selector, eventType, eventFunc) {
        this.elements(selector).map(function (eventTarget) {
            eventTarget.addEventListener(eventType, eventFunc);
        });
    };
    DOMUtils.prototype.elements = function (selector) {
        var elements = document.querySelectorAll(selector);
        return [].map.call(elements, function (el) {
            return el;
        });
        //return [...document.querySelectorAll(selector)];
    };
    DOMUtils.prototype.forAllDOMelements = function (selector, execFunc) {
        this.elements(selector).map(function (domElement) {
            execFunc.call(domElement, domElement);
        });
    };
    DOMUtils.prototype.html = function (selector, html) {
        this.forAllDOMelements(selector, function (el) {
            el.innerHTML = html;
        });
    };
    DOMUtils.prototype.addClick = function (selector, func) {
        this.addEventListeners(selector, 'click', func);
    };
    DOMUtils.prototype.stopPropagation = function (event, scope) {
        //todo licensecheck here
        event.stopPropagation();
    };
    return DOMUtils;
}());
var LocalStorageSettings = /** @class */ (function () {
    function LocalStorageSettings(localStorageString) {
        this.stringname = localStorageString;
        this.settings = {
            displaySeconds: false,
            audioNotifications: false,
            cameraEnabled: true,
            lastOpenedControlPage: '',
            language: navigator.language
        };
        this.read();
    }
    LocalStorageSettings.prototype.setSetting = function (setting, value) {
        this.settings[setting] = value;
        this.save();
    };
    LocalStorageSettings.prototype.getSetting = function (setting) {
        return this.settings[setting];
    };
    LocalStorageSettings.prototype.save = function () {
        localStorage.setItem(this.stringname, JSON.stringify(this.settings));
    };
    LocalStorageSettings.prototype.keys = function () {
        return Object.keys(this.settings);
    };
    LocalStorageSettings.prototype.read = function () {
        var stored = localStorage.getItem(this.stringname);
        try {
            stored = stored ? JSON.parse(stored) : {};
        }
        catch (e) {
            console.warn(e);
        }
        Object.keys(stored).forEach(function (key) {
            return this.settings.hasOwnProperty(key) ? this.settings[key] = stored[key] : null;
        }.bind(this));
    };
    return LocalStorageSettings;
}()); // LocalStorageSettings
var TimeWatcher = /** @class */ (function () {
    /*
    * display calendar notifications
    * warns about inactive period
    *
    * */
    function TimeWatcher() {
    }
    TimeWatcher.prototype.add = function () {
    };
    TimeWatcher.prototype.delete = function () {
    };
    return TimeWatcher;
}());
var Message = /** @class */ (function () {
    function Message(daysee, msg, sticky) {
        this.daysee = daysee;
        daysee.log('Show new Message', msg);
        var drawerHeight = 16;
        var topMessageElement = this.Top = document.getElementById('TopMessage');
        topMessageElement.innerHTML = msg;
        topMessageElement.style.height = drawerHeight + 'vh';
        var containerElement = this.Container = document.getElementById('Container');
        containerElement.style.top = drawerHeight + 'vh';
        var containerHeight = 100 - drawerHeight;
        containerElement.style.height = containerHeight + 'vh';
        if (!sticky)
            setTimeout(this.hide, 1000);
    }
    Message.prototype.hide = function () {
        this.Container.style.height = '100vh';
        this.Container.style.top = '0vh';
        this.daysee.redraw();
    };
    return Message;
}());
var __Assistent_States = ['LOADING', 'INIT', 'READY', 'WAITING'];
var __Assistent_UNKNOWN = 'Unknown state';
var __Assistent_LOADING = 0;
var __Assistent_INIT = 1;
var __Assistent_READY = 2;
var __Assistent_WAITING = 3;
var Assistent = /** @class */ (function () {
    function Assistent(daysee) {
        try {
            daysee.log('Class: Assistent');
            this.daysee = daysee;
            this.initstate = -1;
            this.voice = false;
            //this.initSpeechInterface(daysee);
        }
        catch (e) {
            daysee.error(e);
        }
    }
    Object.defineProperty(Assistent.prototype, "state", {
        get: function () {
            var statename = __Assistent_States[this.initstate];
            return statename ? statename : __Assistent_UNKNOWN;
        },
        set: function (nr) {
            //can only be set by asisstent
        },
        enumerable: true,
        configurable: true
    });
    ;
    Assistent.prototype.start = function () {
        return this;
    };
    Assistent.prototype.initSpeechInterface = function (setspeechenabled) {
        var assistent = this;
        var daysee = assistent.daysee;
        assistent.speaks = setspeechenabled;
        if (assistent.speaks) {
            assistent.initstate = __Assistent_INIT;
            try {
                assistent.voice.fatality(); //kill any existing artyom commands
            }
            catch (e) {
            }
            assistent.voice = new SpeechInterface(daysee);
            assistent.voice.init(daysee.clock.clock_language).then(function () {
                assistent.initstate = __Assistent_READY;
            });
        }
        else {
            assistent.voice = false;
            daysee.warn('speech is disabled');
        }
    };
    Assistent.prototype.command = function (commandName) {
        var assistent = this;
        var daysee = assistent.daysee;
        assistent.name = commandName;
        if (this.initstate === __Assistent_LOADING) {
            daysee.log('assistent ON HOLD:', assistent.state, ' command:', commandName, assistent);
            setTimeout(assistent.command.bind(assistent), 500); //call command again after msecs
        }
        else {
            daysee.log('command:', commandName, 'state:', assistent.initstate);
            switch (commandName) {
                case __COMMAND_clockcanvas:
                    daysee.showingDaySeeControls = !daysee.showingDaySeeControls;
                    daysee.showDaySeeControls(daysee.showingDaySeeControls);
                    break;
                case 'Control_MaximizeClock':
                    daysee.showDaySeeControls(false);
                    break;
                case 'Control_Reload':
                    daysee.reloadWebPage(0);
                    break;
                case 'Control_Calendar':
                    //daysee.showDaySee_Calendar();
                    break;
                case 'Control_Information':
                    break;
                case 'btn_Memory':
                    daysee.log('playing memory');
                    daysee.showDaySeeControls('Memory');
                    new MemoryTrainer();
                    break;
                default:
                    ;
            }
        }
    };
    Assistent.prototype.sayTime = function (speaks, always) {
        var assistent = this;
        var daysee = assistent.daysee;
        var clock = daysee.clock;
        if (typeof speaks === 'boolean')
            assistent.speaks = speaks;
        function clockdigits(n) {
            n = String(n);
            if (n.length === 1)
                n = '0' + n;
            return n;
        }
        var timesincelastspoken = daysee.lastspokentime;
        var saytime = always || true;
        if (saytime) {
            daysee.lastspokentime = new Date();
            var str = clock.strDate_weekday; // + " " + strDate_daypart + " , " + strDate_DMY;
            return assistent.say(str + " " + clockdigits(clock.clockfullHours) + ":" + clockdigits(clock.clockMinutes));
        }
        else {
            return Promise.resolve();
        }
    };
    Assistent.prototype.say = function (text, onSpeechStart, onSpeechEnd) {
        var assistent = this;
        if (assistent.speaks) {
            return this.voice.say(text, onSpeechStart, onSpeechEnd);
        }
        else {
            assistent.daysee.warn('Assistent is silenced, ', text);
            return Promise.resolve(assistent);
        }
    };
    Assistent.prototype.addCommand = function (command, func) {
        return this.voice.addCommand(command, func);
    };
    Assistent.prototype.setLanguage = function (language) {
        var assistent = this;
        var daysee = this.daysee;
        var clock = daysee.clock;
        //language = language || navigator.language;
        language = language.split('-')[0];
        daysee.log('set new language', language, clock.clock_language);
        clock.clock_language = language;
        daysee.setting('language', language);
        clock.initCurrentDateAndTime(language);
        document.getElementById('Current_daysee_language').setAttribute('name', 'flag:' + language);
        var usesAudio = daysee.setting('audioNotifications');
        assistent.initSpeechInterface(usesAudio);
        if (usesAudio) {
            //bug? first language is always default Artyom en-GB
            //                assistent.sayTime();
            setTimeout(function () {
                assistent.sayTime();
            }, 100);
        }
    };
    Assistent.prototype.playMemory = function () {
        //todo
    };
    return Assistent;
}());
var dateParse = function (date) {
    if (date instanceof moment) {
        date = date.toDate();
    }
    else {
        if (!date)
            return false;
        if (date.hasOwnProperty('dateTime')) {
            date = date.dateTime;
        }
        else {
            date = date.date || date;
        }
    }
    return new Date(date);
};
var DaySeeEvent = /** @class */ (function () {
    function DaySeeEvent(daysee, item) {
        var evnt = this;
        evnt.daysee = daysee;
        evnt.item = item;
        evnt.id = item.id;
        evnt.title = item.summary ? item.summary : '';
        evnt.description = item.description || '';
        evnt.start = dateParse(item.start);
        evnt.end = dateParse(item.end);
        var hasTransparancy = item.hasOwnProperty('transparency');
        evnt.isAnnouncement = hasTransparancy && item.transparency === 'transparent';
        evnt.isAppointment = hasTransparancy ? item.transparency === 'opaque' : true;
        evnt.initReminder();
        evnt.duration = +evnt.end - +evnt.start;
        evnt.isPast = evnt.start < new Date();
        evnt.isFuture = evnt.start > new Date();
        evnt.slot = evnt.isAppointment ? evnt.textMoment(evnt.start, 'time') + ' - ' + evnt.textMoment(evnt.end, 'time') : '';
    }
    DaySeeEvent.prototype.initReminder = function () {
        var evnt = this;
        var isReminder = evnt.title.indexOf('eminder') > -1;
        evnt.isReminder = isReminder;
        if (isReminder) {
            evnt.isAppointment = false;
            evnt.isAnnouncement = false;
        }
        else {
        }
    };
    DaySeeEvent.prototype.nowMoment = function (date) {
        return moment(date);
    };
    // get timesincelastshown() {
    //     return this._lastshown && (this._lastshown).diff(this.nowMoment());
    // }
    DaySeeEvent.prototype.textMoment = function (date, period, language) {
        language = language || this.daysee.languageLetters(language);
        date = date || new Date();
        moment.locale(language);
        var localeperiod = moment(date).fromNow();
        try {
            if (period === 'calendar')
                localeperiod = moment(date).calendar();
            if (period === 'duration')
                localeperiod = moment.duration(date).humanize();
            if (period === 'day')
                localeperiod = moment(date).format('dddd D MMMM');
            if (period === 'time')
                localeperiod = moment(date).format('HH:mm');
        }
        catch (e) {
            this.daysee.error(e, date);
        }
        return localeperiod;
    };
    Object.defineProperty(DaySeeEvent.prototype, "text_from", {
        get: function () {
            return this.textMoment(this.start);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaySeeEvent.prototype, "text_calendar", {
        get: function () {
            return this.textMoment(this.start, 'calendar');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaySeeEvent.prototype, "text_duration", {
        get: function () {
            return this.textMoment(this.duration, 'duration');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaySeeEvent.prototype, "text_day", {
        get: function () {
            return this.textMoment(this.start, 'day');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaySeeEvent.prototype, "eventtype", {
        get: function () {
            return this.isAnnouncement ? 'Announcement' : this.isReminder ? 'Reminder' : 'Appointment';
        },
        enumerable: true,
        configurable: true
    });
    DaySeeEvent.prototype.speech = function (texttype) {
        var daysee = this.daysee;
        var str = '';
        var desc = this.description;
        var __DAISYMARKER = 'aisy:';
        if (desc) {
            if (desc.includes(__DAISYMARKER)) {
                str = desc.split(__DAISYMARKER)[1].split('}')[0];
                var startmoment = this.textMoment(this.start, texttype); // over 2 dagen
                str = str.replace('[start]', startmoment);
                str = str.replace('[date]', this.text_day);
                str = str.replace('[duration]', this.textMoment(this.start, 'duration'));
                str = str.replace('[time]', this.textMoment(this.start, 'time'));
            }
            else {
                str = this.title + ', ' + this.text_calendar;
            }
        }
        else {
            str = this.title + ', ' + this.text_calendar;
        }
        daysee.log('speech:', str);
        return str;
    };
    Object.defineProperty(DaySeeEvent.prototype, "short", {
        get: function () {
            var _this = this;
            var i = {};
            'title,start,end,slot,text_from,text_calendar,text_duration,duration,isPast,isFuture,isAnnouncement,isAppointment'
                .split(',')
                .map(function (key) { return i[key] = _this[key]; });
            return i;
        },
        enumerable: true,
        configurable: true
    });
    DaySeeEvent.prototype.appendToEventsDIV = function () {
        var el = document.createElement('pre');
        el.innerHTML = JSON.stringify(this.short).replace(/,"/g, '\n,"');
        document.getElementById('events').appendChild(el);
    };
    ;
    DaySeeEvent.prototype.html = function () {
        var event = this;
        var keys = 'slot,title,description';
        var keysdebug = ',text_from,text_calendar,text_duration';
        var eventKeys = keys + keysdebug;
        var eventLine = function (key) {
            var classDebug = keysdebug.includes(key) ? 'event_debug' : '';
            var html = "<DIV class=\"event_" + key + " " + classDebug + "\" key=\"" + key + "\" title=\"" + key + ":" + event[key] + "\">" + event[key] + "</DIV>";
            event.daysee.log(html);
            return html;
        };
        var html_events = eventKeys.split(',')
            .map(eventLine)
            .join('');
        return "<DIV eventid=\"" + event.id + "\" class=\"calendarEvent calendar" + event.eventtype + "\">" + html_events + "</DIV>";
    };
    return DaySeeEvent;
}());
var Control_Calendar = /** @class */ (function () {
    function Control_Calendar(daysee, calendar) {
        try {
            var CalendarControl = this;
            CalendarControl.daysee = daysee;
            CalendarControl.calendar = calendar || daysee.calendar;
            CalendarControl.showHTML();
        }
        catch (e) {
            daysee.error(e);
        }
    }
    Control_Calendar.prototype.showHTML = function () {
        var daysee = this.daysee;
        var calendar = this.calendar;
        //calendar.reload();
        daysee.DOM.html('#CalendarItems', calendar.html());
        daysee.DOM.addClick(".calendarEvent", function (event) {
            daysee.DOM.stopPropagation(event);
            daysee.log('clicked calendarEvent\n', event, this);
            var eventid = this.getAttribute('eventid');
            calendar.readevents(eventid);
        });
        var nextAppointment = calendar.nextAppointment();
        if (nextAppointment) {
            daysee.assistent.say(nextAppointment.speech());
            var msg = nextAppointment.slot + " - " + nextAppointment.title;
            new Message(daysee, msg);
            daysee.redraw();
        }
    };
    return Control_Calendar;
}());
var DaySeeCalendar = /** @class */ (function () {
    function DaySeeCalendar(daysee, periodStart, periodEnd) {
        var calendar = this;
        calendar.events = [];
        calendar.daysee = daysee;
        function period(date, addNdays) {
            var m = moment(date);
            if (addNdays)
                m = m.add(addNdays, 'days');
            return m.toDate().toISOString();
        }
        var today = period(new Date());
        calendar.periodStart = periodStart ? periodStart : today;
        calendar.periodEnd = periodEnd ? periodEnd : period(calendar.periodStart, 7);
    }
    DaySeeCalendar.prototype.loadGoogleCalendar = function (calendarId) {
        var daysee = this.daysee;
        this.calendarId = calendarId;
        var calendar = this;
        return new Promise(function (resolve, reject) {
            var APIkey = 'AIzaSyCR3-ptjHE-_douJsn8o20oRwkxt-zHStY';
            var period = "&timeMin=" + calendar.periodStart + "&timeMax=" + calendar.periodEnd;
            fetch("https://www.googleapis.com/calendar/v3/calendars/" + calendarId + "/events?key=" + APIkey + "&singleEvents=true&orderBy=startTime" + period)
                .then(function (response) { return response.json(); })
                .then(function (calendarEvents) {
                //deleted: daysee.calendarEvents = calendarEvents;
                calendar.additems(calendarEvents.items);
                calendar.addDemoItems();
                daysee.log('loadedGoogleCalendar', calendarId, calendar.events.length, 'calendaritems');
                resolve(calendar.events);
            }).catch(function (e) {
                daysee.error(e);
                reject();
            });
        });
    };
    DaySeeCalendar.prototype.reload = function () {
        this.clear();
        return this.loadGoogleCalendar(this.calendarId);
    };
    DaySeeCalendar.prototype.addDemoItems = function () {
        var now = +new Date();
        var start = new Date(new Date(Number(now + 1000 * 60 * 60 * 24 * 3)).setMinutes(0));
        //this.addDemoItem('Dokter X', '{daisy:De dokter komt voor de wekelijkse controle, [start] }', start);
    };
    DaySeeCalendar.prototype.addDemoItem = function (summary, description, start, end) {
        var id = +new Date();
        end = end || moment(start).add(1, 'h');
        this.add({
            id: id, summary: summary, description: description, start: start, end: end,
            transparancy: 'opaque'
        });
    };
    DaySeeCalendar.prototype.additems = function (items) {
        var _this = this;
        items.forEach(function (item) { return _this.add(item); });
    };
    DaySeeCalendar.prototype.add = function (item) {
        var event = new DaySeeEvent(this.daysee, item);
        this.events.push(event);
    };
    DaySeeCalendar.prototype.clear = function () {
        this.events = [];
    };
    Object.defineProperty(DaySeeCalendar.prototype, "sortedevents", {
        get: function () {
            return this.events.sort(function (a, b) { return b.start - a.start; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaySeeCalendar.prototype, "nextevents", {
        get: function () {
            return this.sortedevents.filter(function (event) { return event.isFuture; }).reverse();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaySeeCalendar.prototype, "nextannouncements", {
        get: function () {
            return this.nextevents.filter(function (event) { return event.isAnnouncement; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaySeeCalendar.prototype, "nextappointments", {
        get: function () {
            return this.nextevents.filter(function (event) { return event.isAppointment; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaySeeCalendar.prototype, "nextreminders", {
        get: function () {
            return this.nextevents.filter(function (event) { return event.isReminder; });
        },
        enumerable: true,
        configurable: true
    });
    DaySeeCalendar.prototype.event = function (nr) {
        if (typeof nr === 'string')
            return this.events.find(function (event) { return event.id === nr; });
        else
            return nr < this.events.length ? this.events[nr] : false;
    };
    DaySeeCalendar.prototype.nextAnnoucement = function () {
        return this.nextannouncements[0];
    };
    DaySeeCalendar.prototype.nextAppointment = function () {
        return this.nextappointments[0];
    };
    DaySeeCalendar.prototype.nextEvent = function () {
        return this.nextevents[0];
    };
    DaySeeCalendar.prototype.nextReminder = function () {
        return this.nextreminders[0];
    };
    DaySeeCalendar.prototype.html = function (arr) {
        var newDay = function (x) { return '<DIV class="calendarDay">' + x + '</DIV>'; };
        var prevDay = false;
        var HTML = (arr || this.nextevents).reduce(function (HTML, event) {
            var thisday = event.text_day;
            var sameDay = function (x, y) { return x === y; };
            var anotherDay = function (x, y) { return x !== y; };
            HTML += anotherDay(thisday, prevDay) ? newDay(thisday) : '';
            prevDay = thisday;
            return HTML + event.html();
        }, '');
        return HTML;
    };
    DaySeeCalendar.prototype.list = function () {
        var daysee = this.daysee;
        daysee.log(daysee.calendar.events.map(function (e) { return e.start + " - " + e.slot + ' - ' + e.title; }).join('\n'));
    };
    DaySeeCalendar.prototype.readevents = function (eventid) {
        var calendar = this;
        var daysee = calendar.daysee;
        if (eventid) {
            var appointment = eventid;
            if (typeof appointment === 'string')
                appointment = calendar.event(eventid);
            daysee.assistent.say(appointment.speech());
        }
        else {
            this.nextappointments.forEach(calendar.readevents);
        }
    };
    return DaySeeCalendar;
}());
var DaySee = /** @class */ (function () {
    //false or date
    function DaySee(settings) {
        var daysee = this;
        daysee.DOM = new DOMUtils();
        daysee.hasUserMedia = settings.hasUserMedia;
        daysee.languages = settings.languages;
        daysee.controls = {};
        daysee.featurenames = [
            /* 00 */ "Digital Clock",
            /* 01 */ "Google Calendar",
            /* 02 */ "Google OR Outlook Calendar",
            /* 03 */ "Photo Gallery",
            /* 04 */ "Motion Monitor",
            /* 05 */ "Interactive Games",
            /* 06 */ "Connect API"
        ];
        daysee.init();
        daysee.run();
    }
    DaySee.prototype.log = function (a, b, c, d, e, f) {
        var daysee = this;
        if (console) {
            var consoletype = 'log';
            //let colors=this;
            var colors = { 'background': 'transparent', color: 'black' }; //colors CAN be defined as scope parameter
            if (typeof a === 'string') {
                if (a === 'error') {
                    colors = { 'background': 'red', 'color': 'white' };
                    a = b;
                    b = false;
                    consoletype = 'error';
                }
                else if (a === 'warn') {
                    colors = { 'background': 'orange', 'color': 'black' };
                    a = b;
                    b = false;
                    consoletype = 'warn';
                }
            }
            var color1 = 'background:green;color:white;';
            var color2 = 'background:' + (colors.background || 'lightgreen');
            color2 = color2 + ';color:' + (colors.color || 'black');
            color2 = color2 + ';font-weight:bold;';
            if (!!window.chrome) {
                var $logtype = (colors.color === '#001') ? 'Part:' : ''; //color:'#001' identifies console from muxPart
                var duration = '';
                console[consoletype]('%c DaySee ' + duration + ' ' + $logtype + ' %c ' + a + ' ', color1, color2, b || '', c || '', d || '', e || '', f || '');
            }
            else {
                /** IE or Edge browser */
                //            let title = document.getElementById('DeltaPlaceHolderPageTitleInTitleArea');
                //            $E.$el('div', ' ' + a , false, false, title);// trace to pageTitle on IE
                console[consoletype]('DaySee ' + a + ' ', b || '', c || '', d || '', e || '', f || '');
            }
        }
    };
    DaySee.prototype.warn = function (a, b, c, d, e) {
        this.log('warn', a, b, c, d, e);
    };
    DaySee.prototype.log_functionname = function (a, b, c, d, e) {
        var name = (new Error().stack).split('\n')[2].trim();
        name = name.split('(https')[0];
        var logtype = 'warn';
        if (a) {
            this.log(logtype, a, name, '', '', '');
        }
        else if (b) {
            this.log(logtype, a, b, name, '', '');
        }
        else if (c) {
            this.log(logtype, a, b, c, name, '');
        }
        else {
            this.log(logtype, name, '', '', '', '');
        }
    };
    DaySee.prototype.error = function (txt, data) {
        if (console) {
            if (data instanceof XMLHttpRequest) {
                var responseErrorMessage = '';
                try {
                    responseErrorMessage = '\n' + data.response.error.message.value;
                }
                catch (e) {
                }
                this.log('error', txt, data.status, data.statusText, data.responseURL, responseErrorMessage);
            }
            else {
                this.log('error', txt, data || '');
                console.log(new Error().stack);
            }
        }
    };
    DaySee.prototype.controlActivator = function (controlName) {
        var daysee = this;
        daysee.log('Trying to activate Control:', controlName);
        daysee.showControlPageTab(controlName);
        var ctrlObject = window[controlName];
        if (typeof ctrlObject === 'function') {
            try {
                daysee.controls[controlName] = new ctrlObject(daysee);
                return true;
            }
            catch (e) {
                daysee.error('No class for:', controlName);
                return false;
            }
        }
        else {
            return false;
        }
    };
    DaySee.prototype.init = function () {
        var daysee = this;
        daysee.initSettings();
        daysee.backgroundColor(__canvas_backgroundColor);
        daysee._DaisyFlower_Logo_Image = new Image();
        daysee._DaisyFlower_Logo_Image.src = 'data:image/png;base64,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';
        daysee.listenToAudioCommands = false;
        daysee.lastHomePageVisit = false;
        daysee.features = [
            true,
            false,
            false,
            false,
            false,
            false
        ]; // API
        //daysee.initUrlParameters('123456');
        daysee.showingDaySeeControls = false;
        daysee.isOpenControlPage = false;
        daysee.initFeature_Clock();
        daysee.initFeature_Calendar();
        daysee.initFeature_MotionMonitor();
        daysee.initUXEventListeners();
        daysee.assistent = new Assistent(daysee);
    };
    DaySee.prototype.initFeature_Clock = function () {
        var daysee = this;
        daysee.log_functionname(21);
        daysee.clock = new Clock({
            container: '#Container',
            clock_language: daysee.setting('language'),
            //        clockTestDate: getUrlParameter('date'),
            canvas_backgroundColor: __canvas_backgroundColor,
            clock_faceColor: 'black',
            clock_letterColor: 'wheat',
            centerIMG: daysee._DaisyFlower_Logo_Image,
            reloadHTMLpageEveryHour: true
        }, daysee);
    };
    DaySee.prototype.initFeature_Calendar = function () {
        var daysee = this;
        daysee.log_functionname();
        if (daysee.hasCalendar) {
            daysee.calendar = new DaySeeCalendar(daysee);
            daysee.calendar.loadGoogleCalendar('daisyalztabs@gmail.com')
                .then(function (events) {
                daysee.showDaySeeControls('__LAST'); //__LAST,Lang,Memory,Configuration,Calendar,Audio,Motion,Information
            });
        }
    };
    DaySee.prototype.initFeature_MotionMonitor = function () {
        var daysee = this;
        if (daysee.hasMotionMonitor) {
            daysee.log_functionname();
            daysee.motion = new MotionMonitor(daysee);
        }
    };
    DaySee.prototype.initUrlParameters = function (features) {
        var daysee = this;
        var dc = daysee.getUrlParameter('dc', false);
        if (dc) {
            var dcArr = dc.split('96910112');
            daysee.lastHomePageVisit = dcArr[0];
            features = dcArr[1];
        }
        features = features.split(''); //0235
        daysee.log('features:', features);
        daysee.hasClock = daysee.hasFeature(0, features);
        daysee.hasCalendar = daysee.hasFeature(1, features);
        daysee.hasGallery = daysee.hasFeature(3, features);
        daysee.hasMotionMonitor = daysee.hasFeature(4, features);
        daysee.hasGames = daysee.hasFeature(5, features);
        daysee.hasAPI = daysee.hasFeature(6, features);
    };
    DaySee.prototype.hasFeature = function (nr, features) {
        var daysee = this;
        if (features) {
            var has = features.indexOf(String(nr)) > -1;
            daysee.features[nr] = has;
            if (has)
                daysee.log('hasFeature:', daysee.featurenames[nr]);
        }
        return daysee.features[nr];
    };
    DaySee.prototype.run = function () {
        var daysee = this;
        var language = this.getUrlParameter('lang', daysee.setting('language'));
        daysee.assistent.setLanguage(language);
    };
    //region ------------------------------------------------------------------------------------- ### Generic functions
    DaySee.prototype.languageLetters = function (language) {
        language = language || this.clock.clock_language;
        return language.split('-')[0];
    };
    DaySee.prototype.languageCode = function (language) {
        var daysee = this;
        var languages = daysee.languages;
        language = daysee.languageLetters(language);
        if (languages.hasOwnProperty(language)) {
            language = languages[language].tag;
        }
        else {
            daysee.error(language, languages);
            language = 'en-GB';
        }
        return language;
    };
    DaySee.prototype.backgroundColor = function (color) {
        document.body.style.backgroundColor = color;
    };
    DaySee.prototype.getUrlParameter = function (name, defaultValue) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? defaultValue : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
    DaySee.prototype.reloadWebPage = function (seconds) {
        var daysee = this;
        window.setTimeout(function () {
            daysee.warn('reloading webPage', seconds);
            //location.reload();
        }, this.clock.__SECOND * seconds);
    };
    DaySee.prototype.redraw = function () {
        var _this = this;
        var daysee = this;
        daysee.log('redraw clock');
        window.setTimeout(function () {
            _this.clock.redrawScreen();
        }, 300);
    };
    DaySee.prototype.fullscreen_On = function () {
        try {
            document.documentElement.webkitRequestFullscreen(); // Chrome & Edge
            this.redraw();
        }
        catch (e) {
            document.documentElement['msRequestFullscreen'](); // IE 10
            this.redraw();
        }
    };
    DaySee.prototype.fullscreen_Off = function () {
        try {
            document.webkitExitFullscreen(); // Chrome & Edge
        }
        catch (e) {
            //noinspection TypeScriptUnresolvedFunction
            document['msExitFullscreen'](); // IE 10
        }
        this.redraw();
    };
    DaySee.prototype.initTimeOuts = function () {
        var daysee = this;
        window.setTimeout(function () {
            if (!daysee.isOpenControlPage) {
                if (daysee.showDaySeeControls)
                    daysee.showDaySeeControls(false);
            }
        }, __SWITCH_TO_FULLSCREEN_AFTER_X_MINUTES);
        window.addEventListener("resize", function () {
            daysee.log("Event: resize");
            daysee.redraw();
        }, false); //not alls support orientationchange event
    };
    DaySee.prototype.setDate = function (event, me) {
        var daysee = this;
        daysee.DOM.stopPropagation(event, this);
        this.clock.clockTestDate = false;
        if (me)
            this.clock.clockTestDate = me.getAttribute('date');
        this.clock.drawCanvasContainer();
    };
    //endregion -------------------------------------------------------------------------------------- Generic functions
    /* Show the overlay for setting DaySee options/languages */
    DaySee.prototype.showDaySeeControls = function (firstControlDisplayed) {
        var daysee = this;
        if (firstControlDisplayed === '__LAST')
            firstControlDisplayed = daysee.setting('lastOpenedControlPage');
        if (typeof firstControlDisplayed === 'boolean') {
            daysee.showingDaySeeControls = firstControlDisplayed;
        }
        else {
            daysee.showingDaySeeControls = firstControlDisplayed && firstControlDisplayed.length > 0;
        }
        daysee.DOM.visibility('#Controls__ButtonBar', firstControlDisplayed);
        if (firstControlDisplayed) {
            daysee.fullscreen_Off();
            daysee.command(firstControlDisplayed);
        }
        else {
            daysee.showControlPageTab('none');
            daysee.fullscreen_On();
        }
    };
    DaySee.prototype.showControlPageTab = function (except_id) {
        var daysee = this;
        function hideAllControlTabs_Except(me) {
            var hideControl = 'none';
            if (except_id) {
                if (me.id.includes(except_id)) {
                    hideControl = 'inherit';
                    openedTab(except_id);
                }
            }
            else {
                daysee.isOpenControlPage = false;
            }
            me.style.display = hideControl;
        }
        function openedTab(id) {
            var ctrlName = id;
            if (daysee.assistent.voice)
                daysee.assistent.voice.shutUp();
            daysee.isOpenControlPage = true;
            daysee.log('Opened Control:', id, typeof [ctrlName]);
        }
        daysee.DOM.forAllDOMelements('.ControlPage', hideAllControlTabs_Except);
    };
    DaySee.prototype.initUXEventListeners = function () {
        var daysee = this;
        var DOM = daysee.DOM;
        DOM.addClick('#Container', function (event) {
            DOM.stopPropagation(event, this);
            daysee.command(__COMMAND_clockcanvas);
        });
        DOM.addClick('.ControlButton', function (event) {
            DOM.stopPropagation(event, this);
            daysee.setting('lastOpenedControlPage', this.id);
            daysee.command(this.id);
        });
        DOM.addClick(".Language_Selector mux-icon", function (event) {
            DOM.stopPropagation(event, this);
            var element = this;
            var name = element.getAttribute('name');
            if (name.includes('flag:'))
                daysee.assistent.setLanguage(name.split(':')[1]);
            daysee.clock.drawCanvasContainer();
        });
    };
    DaySee.prototype.command = function (commandString) {
        var daysee = this;
        daysee.log('daysee.Command:', commandString);
        var commandExecuted = false;
        if (typeof commandString === 'string' && commandString.indexOf('Control_') === 0) {
            commandExecuted = daysee.controlActivator(commandString);
        }
        if (!commandExecuted && daysee.assistent) {
            daysee.assistent.command(commandString);
        }
        else {
            daysee.error('Missing assistent');
        }
    };
    //region ------------------------------------------------------------------------------------- ### Control_Configuration_Settings
    DaySee.prototype.initSettings = function () {
        var daysee = this;
        try {
            this.settings = new LocalStorageSettings('daysee');
            daysee.log('info', 'loaded settings:', this.settings);
        }
        catch (e) {
            daysee.error('settings', e);
        }
        var settings = this.settings;
        /**
         * Proces all daysee_settings
         * for every matching LABEL , add a click, and only proces one click
         */
        try {
            settings.keys().map(function (key) {
                var _this = this;
                var el = document.querySelector('#TrueFalse_' + key);
                if (el) {
                    try {
                        //early attempt at Functional Programming
                        var input_1 = function (el) { return el.querySelector('input'); };
                        var get_1 = function () { return settings.getSetting(key); };
                        var set_1 = function (value) { return settings.setSetting(key, value); };
                        var check_1 = function () { return input_1(el).setAttribute('checked', ''); };
                        var uncheck_1 = function () { return input_1(el).removeAttribute('checked'); };
                        var setinput_1 = function () { return get_1() ? check_1() : uncheck_1(); };
                        var toggle_1 = function () { return set_1(!get_1()) && setinput_1(); };
                        var toggleinput_1 = function (event) { return event.target instanceof HTMLInputElement ? toggle_1() : null; };
                        var clicked = function (event) {
                            daysee.DOM.stopPropagation(event, _this);
                            toggleinput_1(event);
                        };
                        setinput_1();
                        el.addEventListener('click', clicked);
                    }
                    catch (e) {
                        daysee.error('key:' + key, e);
                    }
                }
                else {
                    daysee.warn('Missing element', key);
                }
            });
        }
        catch (e) {
            daysee.error(e);
        }
    };
    DaySee.prototype.setting = function (str, value) {
        if (value) {
            this.settings.setSetting(str, value);
        }
        else {
            return this.settings.getSetting(str);
        }
    };
    return DaySee;
}());
var SpeechInterface = /** @class */ (function () {
    function SpeechInterface(daysee) {
        var speechinterface = this;
        this.daysee = daysee;
        try {
            speechinterface.artyomLibrary = new Artyom();
        }
        catch (e) {
            console.error(e);
            speechinterface.artyomLibrary = artyom;
        }
        speechinterface.language = daysee.clock.clock_language;
        //            this.init(language).then(() => {
        //                daysee.log('speechinit done', this);
        //                if (initDone) initDone();
        //            });
    }
    SpeechInterface.prototype.init = function (language) {
        var speechinterface = this;
        var daysee = this.daysee;
        var clock = daysee.clock;
        daysee.log('languages:', language, speechinterface.language);
        console.info('L:', this.artyomLibrary.getLanguage(), '►', daysee.languageCode(speechinterface.language));
        return this.artyomLibrary.initialize({
            //lang: 'nl-NL',
            lang: daysee.languageCode(speechinterface.language),
            continuous: true,
            soundex: true,
            debug: false,
            executionKeyword: "Daisy",
            listen: daysee.listenToAudioCommands // Start to listen commands !
        }).then(function () {
            daysee.log("Artyom initialized with language", daysee.languageCode(speechinterface.language));
            speechinterface.addCommand(['Memory'], function (i) {
                daysee.assistent.playMemory();
            });
            speechinterface.artyomLibrary.addCommands([
                {
                    indexes: ['klok', 'de tijd', 'laat is het'],
                    action: function (i) {
                        daysee.showDaySeeControls(false);
                        speechinterface.artyomLibrary.say("Het is " + clock.strDate_weekday + " " + clock.clockfullHours + ":" + clock.clockMinutes);
                    }
                },
                {
                    indexes: ['afspraak', 'komt straks', 'komt vandaag'],
                    action: DaySeeCalendar
                },
                {
                    indexes: ['opnieuw'],
                    action: function (i) {
                        daysee.reloadWebPage(0);
                        daysee.assistent.say('reload');
                    }
                },
            ]);
            return (speechinterface);
        }).catch(function (err) {
            daysee.error("Artyom couldn't be initialized: ", err);
            //reject();
        });
    };
    SpeechInterface.prototype.addCommand = function (command, func) {
        var speechinterface = this;
        speechinterface.artyomLibrary.on(command).then(function (i) {
            this.daysee.log('addCommand', i, command, func, this);
            func.call(this, i);
        });
    };
    SpeechInterface.prototype.showCurrentLanguage = function () {
    };
    SpeechInterface.prototype.setLanguage = function (lang) {
    };
    SpeechInterface.prototype.shutUp = function () {
        this.artyomLibrary.shutUp();
    };
    SpeechInterface.prototype.dontObey = function () {
        this.artyomLibrary.dontObey();
    };
    SpeechInterface.prototype.say = function (text, onSpeechStart, onSpeechEnd) {
        var speechinterface = this;
        var daysee = this.daysee;
        return new Promise(function (resolve, reject) {
            if (!text) {
                resolve(); //empty text breaks speech command?
            }
            else {
                speechinterface.shutUp();
                speechinterface.dontObey();
                daysee.log(speechinterface.artyomLibrary.getLanguage(), 'says: ', text);
                speechinterface.artyomLibrary.say(text, {
                    onStart: function () {
                        daysee.log("Speaking ...", text);
                        speechinterface.isSpeaking = true;
                        if (onSpeechStart)
                            onSpeechStart(text);
                    },
                    onEnd: function () {
                        daysee.log("End Speaking", text);
                        speechinterface.isSpeaking = false;
                        speechinterface.wasSpoken = text;
                        if (onSpeechEnd)
                            onSpeechEnd(text);
                        speechinterface.artyomLibrary.obey();
                        if (resolve)
                            resolve();
                    },
                    lang: speechinterface.artyomLibrary.getLanguage()
                });
            }
        });
    };
    return SpeechInterface;
}());
/*
 say         :   speak text
 silenced    :   don't repeat within x time'
 commands    :   listen for commands
 answers     :   execute function for command
 once        :
 */
var SpeechSentence = /** @class */ (function () {
    function SpeechSentence(settings) {
        this.lastspoken = false;
    }
    SpeechSentence.prototype.say = function () {
    };
    return SpeechSentence;
}());
var MotionMonitor = /** @class */ (function () {
    function MotionMonitor(daysee) {
        this.daysee = daysee;
        this.motion_history = [];
        if (daysee.hasUserMedia && daysee.setting('cameraEnabled') && document.location.protocol === 'https:') {
            this.activate();
        }
        else {
            daysee.log('MotionMonitoring NOT enabled');
        }
    }
    MotionMonitor.prototype.activate = function () {
        var motion = this;
        var DiffCamEngineLibrary = DiffCamEngine;
        var firebaseDB = window.firebase;
        function sendMotionToCloud(data) {
            this.daysee.log('sendMotionToCloud', firebaseDB);
            firebaseDB.database().ref('users/22/' + data.timestamp).set(data.motion);
        }
        var canvas = document.getElementById("motionGraph");
        var ctx = canvas.getContext("2d");
        //canvas.width = canvas.style.width;
        //ctx.setTransform(1, 0, 0, 1, 0, 0);
        function drawBarGraphTimer(values) {
            var previouswidth = canvas.width / (values.length - 1);
            var width = canvas.width / values.length;
            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            var drawvalues = values.slice();
            drawvalues.forEach(function (barheight, idx) {
                ctx.clearRect(idx * previouswidth, 0, previouswidth, canvas.height);
                ctx.fillStyle = barheight > 100 ? "green" : "red";
                ctx.fillRect(idx * width, canvas.height - barheight, width, barheight);
            });
        }
        function barGraphValue(newValue) {
            var values = motion.motion_history;
            values.push(newValue);
            if (values.length > 30 * 10)
                values.shift();
            drawBarGraphTimer(values);
        }
        DiffCamEngineLibrary.init({
            video: document.querySelector("#Control_MotionMonitor_Settings video"),
            motionCanvas: document.querySelector("#Control_MotionMonitor_Settings canvas"),
            captureIntervalTime: 1000,
            includeMotionBox: true,
            includeMotionPixels: true,
            initSuccessCallback: function () {
                console.log('DiffCamEngine started');
                DiffCamEngineLibrary.start();
            },
            initErrorCallback: function () {
                alert('The Browser is not allowed to access you camera. Motion monitoring is disabled.\nSee you browser settings to enable using the camera');
            },
            startCompleteCallback: function () {
            },
            captureCallback: function (payload) {
                //imageData
                //score
                //hasMotion
                //motionBox
                //motionPixels
                //getURL
                //checkMotionPixel
                document.querySelector("#Control_MotionMonitor_Settings .score").textContent = payload.score;
                var scorepercentage = (payload.score / 10);
                var motionScore = document.querySelector("#MotionScore");
                motionScore.style.width = scorepercentage + '%';
                barGraphValue(payload.score);
                var timestamp = Date.now();
                var motiondata = {
                    "timestamp": timestamp,
                    "motion": scorepercentage
                };
                //this.daysee.log(timestamp, scorepercentage);
                if (scorepercentage > 50) {
                    sendMotionToCloud(motiondata);
                }
                if (scorepercentage > 10) {
                    //                    motion_history.push(motiondata);
                }
            }
        });
    };
    return MotionMonitor;
}());
