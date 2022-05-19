# Configure Windows 10 Tablet for DaySee.org Clock

Windows 10 Tablets are preffered as they are highly configurable.  
iPads and Android tablets will by default turn on the screensaver after 30 minutes. Note: some android versions can disable the screensaver in  'Developer mode'  

## Where to find a used Windows 10 Tablet

* [eBay Windows 10 tablets](https://www.ebay.co.uk/sch/i.html?_from=R40&_trksid=p2322090.m570.l1313.TR12.TRC2.A0.H0.Xwindows+10+tablet.TRS0&_nkw=windows+10+tablet&_sacat=0)
* [Cheapest Amazon Tablet](https://www.amazon.com/NuVision-Touchscreen-x5-Z8300-Quad-Core-Processor/dp/B01MYZEPGP/ref=pd_cp_147_1?_encoding=UTF8&pd_rd_i=B01MYZEPGP&pd_rd_r=KWK3TTTG6AXCFHVABSYM&pd_rd_w=cXlnU&pd_rd_wg=S0yqF&psc=1&refRID=KWK3TTTG6AXCFHVABSYM#HLCXComparisonWidget_feature_div)
* [TrekStor Surftab @ rebuy.nl](https://www.rebuy.nl/kopen/zoeken?sortBy=price_asc&q=surftab)

Only for the clock a Windows RT or Windows 8 tablet will do. But those tablets can not use the advanced Chrome APIs (like the camera used for Motion Detection)

# Configuration Windows 10 (GP-Electornic Windows) Tablet

* [Registry options](https://msdn.microsoft.com/en-us/library/dd939844(v=ws.10).aspx)

* [Prevent Windows 10 Auto Update](https://www.howtogeek.com/224471/how-to-prevent-windows-10-from-automatically-downloading-updates/)  
	* Win+R start services.msc
disable and stop Windows Update
* AutoStart Chrome  
	* Win+R Shell:Startup, drag Chrome start in
* Disabled Shared PCs updates
* Settings > Wifi > Advanced Settings >< Connection with Data limit


### Steps overview
* Windows 10
	* Disable Notifications
	* Disable Screensaver
* Optional:
	* Disable password
	* Disable Wifi Hotspots
	* Disable Wifi Network sharing
* Chrome Browser settings
	* Using Chrome Browser
	* Allow audio
	* Allow video

<hr>


### (optional) when device is rooted (reset to factory default settings)

* Timezone settings
* Express setup
* ([skip Microsoft account])
* UserName: DaySee
* No security/login

Wifi inzicht, opties uitzetten

### Windows 10 Configuration

* Open Configuration > System page

* #### Notifications    
 Open Notification settings; disable (Off) all Notifications, ([see screenshot](http://winsupersite.com/site-files/winsupersite.com/files/uploads/2015/07/managenotifications3.png))

* #### Power & sleep
  Set all 4 Screen and Sleep settings to **Never**


#### Extra instellingen: Geen actie ondernemen ipv. Slaapstand

* > (left menu) Een wachtwoord vereisen bij uit slaapstand komen

* > (link) Instellingen wijzigen die momenteel niet beschikbaar zijn

* > (dropdown) **Geen actie ondernemen** voor batterij/netstroom aan/uit knop

* > Geen wachtwoord vereisen

* > scroll down (checkbox) Instellingen voor afsluiten:
    * Alleen Snel opstarten aanvinken
    

Configuration -> System -> Privacy

* > disable Generic privacy options

Configuration -> Accounts -> Password

* > Disable password


### Datum en tijd instellen

Tijd automatisch instellen: **Aan**

Tijdzone automatisch instellen: **Aan**

## Login without password

Default password: daysee

* searchbox: __ntplwiz__ command
* uncheck: require login
* OK

## Optional Windows configurations

launch: ``regedit``

Blog: [Disable auto reboot](http://www.laptopmag.com/articles/disable-automatic-restart-windows) : ``NoAutoRebootWithLoggedOnUsers``

Blog: [Change Account Name](https://www.isunshare.com/windows-10/3-ways-to-change-user-account-name-in-windows-10.html)

Blog: [Execute Chrome on Windows Startup](https://winaero.com/blog/how-to-add-or-remove-startup-apps-in-windows-10/)

Blog: [Run Edge browser in Kiosk mode](https://blogs.msdn.microsoft.com/askie/2015/04/29/how-to-hide-tabs-in-ie11-and-load-in-kiosk-mode-with-or-without-address-bar/)


# Chrome Browser Installeren

* Install latest Chrome Browser
* Set Chrome as default browser
	* Chrome settings -> default browser
	* (Windows 10 settings opens)
	* Open/Select Microsoft Edge
	* Select Chrome Browser
* Set DaySee as default page
	* Chrome Settings -> Default page
	* select: Open a specific page
	* set: daysee.org

## Configure Chrome Browser
* Open webpage daysee.org
    * (optional) ignore translation of this page
    * Allow Camera

Optioneel: Geen rapporten naar Google verzenden

### Open xxx page on start-up

* ... instellingen,
* Openen met specifieke pagina

### Deze site nooit vertalen

### instellen: camera toestaan

Click right side of URL
Allow Camera


* [Set Chrome Full Screen mode](http://ccm.net/faq/31723-activate-full-screen-mode-on-google-chrome)


## Issues

### Windows 10 Events: The Software Protection Services does not restart
  
Workaround is to increase the InactivityShutdownDelay for the SPP. The setting is located at ``HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\SoftwareProtectionPlatform``. I set the ``InactivityShutdownDelay`` to ``0x00015180(86400)``. Once it starts, the SPP will run for 24 hours without shutting down. This should be enough for a workstation. For server apps, try this and check your logs. If needed, you can try a longer timeout.

Also see: http://computerstepbystep.com/software_protection_service.html

