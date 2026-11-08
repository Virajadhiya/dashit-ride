# DASHIT PRIVATE LIMITED - Demo Mobility Ecosystem

Modern, high-converting demo web applications built for **DashIt Private Limited** mobility presentation.

Two completely independent, standalone applications with dedicated mobile UX, dynamic map simulations, sound synthesis, and full PWA/APK readiness.

---

## 📁 Project Structure

```text
rapido/
│
├── index.html                   # Master Showcase Portal & Dual Phone Simulator
├── README.md                    # Documentation & APK Conversion Guide
├── WhatsApp Image...jpeg        # Original DashIt Company Logo
│
├── assets/                      # Shared Branding & Icon Assets
│   ├── logo.jpg                 # DashIt Company Logo
│   ├── logo-transparent.png     # Transparent PNG for headers
│   ├── icon-192.png             # 192x192 PWA & APK Icon
│   └── icon-512.png             # 512x512 High-Res App Icon
│
├── dashit-passenger/            # 📱 DASHIT PASSENGER WEB APP
│   ├── index.html               # Main Passenger App Interface
│   ├── style.css                # Mobile frame, animations & theme
│   ├── app.js                   # Map routing, simulated bookings & audio cues
│   ├── manifest.json            # Android PWA App Manifest
│   ├── sw.js                    # Offline Service Worker
│   ├── icon-192.png             # Passenger App Launcher Icon (192px)
│   ├── icon-512.png             # Passenger App Launcher Icon (512px)
│   └── logo-transparent.png     # Header Logo
│
└── dashit-captain/              # 🚖 DASHIT CAPTAIN PARTNER APP
    ├── index.html               # Main Captain Partner Cockpit & KYC Portal
    ├── style.css                # Dark Cockpit Theme & Pulsing Alerts
    ├── app.js                   # Duty switch, incoming ride pings & payouts
    ├── manifest.json            # Android PWA App Manifest
    ├── sw.js                    # Offline Service Worker
    ├── icon-192.png             # Captain App Launcher Icon with Badge (192px)
    ├── icon-512.png             # Captain App Launcher Icon with Badge (512px)
    └── logo-transparent.png     # Header Logo
```

---

## 🚀 How to Run & Present

### Option A: Direct Browser Preview
Double-click [`index.html`](file:///c:/Users/adhiy/.1/rapido/index.html) to open the **Master Showcase Portal**.
- View both apps running live in side-by-side interactive mobile phone frames.
- Or launch either app directly in full screen:
  - 🏍️ [Passenger App](file:///c:/Users/adhiy/.1/rapido/dashit-passenger/index.html)
  - 🚖 [Captain App](file:///c:/Users/adhiy/.1/rapido/dashit-captain/index.html)

### Option B: Local Web Server (For testing on actual mobile phones)
In your terminal / PowerShell:
```powershell
python -m http.server 8080
# or
npx serve
```
Then open `http://<YOUR_PC_IP>:8080` on your mobile phone browser (connected to the same Wi-Fi) and tap **"Add to Home Screen"** to run them full-screen like native Android/iOS apps!

---

## 📱 How to Generate Free Android APKs for Clients

Both apps are pre-configured with `manifest.json`, Service Workers, icons, and viewport meta tags. You can convert them to APKs in under 2 minutes:

### 1. Using PWABuilder (Official Microsoft Tool - Free & Clean)
1. Deploy the folder to GitHub Pages, Netlify, or Vercel (or use free ngrok / localtunnel).
2. Go to [pwabuilder.com](https://www.pwabuilder.com).
3. Paste the URL of `dashit-passenger/` or `dashit-captain/`.
4. Click **Package for Android** -> Download the `.apk` file!

### 2. Using WebIntoApp.com (No Hosting Required)
1. Visit [webintoapp.com](https://www.webintoapp.com).
2. Choose "HTML Files" and upload the `dashit-passenger` or `dashit-captain` folder.
3. Select App Name (e.g., `DashIt` and `DashIt Captain`), upload the provided icon from `assets/icon-512.png`.
4. Click **"Generate APK"** and download within 60 seconds!

---

## 🌟 Key Features Built for Demo Presentations

### 1. DashIt Passenger App
- **Live Interactive Map**: Clean CartoDB Voyager tiles with user location pulsing radar and moving nearby DashIt Captains (Bikes, Autos, Cabs).
- **Service Categories**: Bike Taxi (⚡ Fastest), Auto (Metered), Cab Mini (AC), Cab Prime (Executive Sedan), and Parcel Express.
- **Booking Flow Simulation**:
  1. *Search & Destination Selection*: Quick chips for Tech Park, MG Road, Airport, Koramangala.
  2. *Fare Comparison*: Transparent pricing with discount codes (`DASH20`).
  3. *Searching Captain*: Radar waves with audio ping.
  4. *Captain Matched*: Displays Captain Profile (Rajesh Kumar ★ 4.9), Vehicle details, live arrival countdown, secret 4-digit start OTP (`5829`), call, and chat modal.
  5. *Live Trip HUD*: Speedometer (42 km/h), remaining distance, SOS emergency button.
  6. *Ride Completed*: Fare breakdown, payment confirmation, 5-star interactive rating, feedback tags, and tips.
- **Full Navigation**: Ride, Activity / Ride History (with 1-click rebook), Wallet (PayLater limit ₹1,500 & referral bonuses), and Profile/Safety Suite.

### 2. DashIt Captain App
- **Dual-Engine Demo Toggle**: Switch seamlessly between **Driver KYC Registration** and **Active Duty Cockpit** with 1 click.
- **Driver KYC Registration Flow**:
  - Vehicle category selection & registration input.
  - Document verification with AI OCR checkmarks (Driving License, Vehicle RC, Aadhaar Card, Selfie with Helmet).
  - Direct daily UPI payout account setup.
  - Instant onboarding approval celebration.
- **Live Cockpit**:
  - Master **Duty Toggle Switch** (`OFFLINE` <---> `ONLINE`).
  - Dark-mode tactical map with **1.4x Surge Heatmap zones**.
  - **Simulate Ride Request Ping**: Urgent pulsating audio alert, 15-second countdown timer, guaranteed earnings banner (`₹85.00`), pickup/drop distance, accept/decline buttons.
  - **Trip Active Flow**: Turn-by-turn guidance, arrival check, 4-digit Passenger OTP verification, slide to start trip, slide to complete trip, instant wallet credit chime.
  - **Earnings Hub**: Today's pay (`₹1,480`), daily target incentive progress bar (`12/15 rides for ₹350 bonus`), weekly earnings bar chart, and **Instant UPI Payout button**.
  - **Captain Benefits**: ₹5 Lakhs free insurance, fuel discounts, Gold Tier perks.
