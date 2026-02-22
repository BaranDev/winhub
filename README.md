<div align="center">
    <img src="src/renderer/src/assets/icon.png" alt="WinHub application icon featuring a blue shopping bag with a circular software management interface design containing interconnected nodes, search functionality, and installation controls representing the app store concept" width="256" height="256">
</div>

# WinHub - The Windows App Store That Actually Works

Tired of hunting through sketchy download sites just to install Chrome? WinHub turns software installation into what it should've been all along - simple, safe, and stupid-fast.

## What is WinHub?

Think of WinHub as your personal software concierge. Instead of playing Russian roulette with random download buttons (you know, the ones surrounded by fake "Download" ads), WinHub connects you directly to Microsoft's official WinGet repository and the Chocolatey Community Repository. Search for any Windows application and get the exact command to install it safely - no bloatware, no surprises, no regrets.

**Why You'll Love It:**
- **Find Anything Instantly**: Search thousands of verified Windows applications across multiple sources
- **Zero Trust Issues**: Everything comes from official repositories (WinGet & Chocolatey)
- **Version Picker**: Want Chrome 115 instead of the latest? No problem
- **Package Intel**: See descriptions, licenses, and official websites before installing
- **PC Migration Magic**: Export your app list from one computer, import on another
- **WinGet Auto-Install**: Don't have WinGet? WinHub can install it for you automatically
- **Actually Good Design**: Dark theme that won't burn your retinas
- **Portable Magic**: Download, unzip, run. No installation drama

### PC Migration in Action

<div align="center">
    <img src="demos/Demo - Export.gif" alt="WinHub PC Migration export demo showing how to export installed applications list for transfer to another computer" width="600">
    <br>
    <em>Export your app list from your current machine</em>
</div>

<br>

<div align="center">
    <img src="demos/Demo - Import.gif" alt="WinHub PC Migration import demo showing how to import an app list and bulk install applications on a new computer" width="600">
    <br>
    <em>Import and bulk-install on your new machine</em>
</div>

## When Should You Use WinHub?

You know that moment when you're setting up a new Windows machine and suddenly realize you need to install about 47 different programs? That's when WinHub becomes your new best friend. Instead of opening 47 browser tabs and playing "spot the real download button," just search once and get clean WinGet commands for everything.

Perfect for when you're too lazy to remember whether Discord's package ID is "Discord.Discord" or "Discord" or "DiscordInc.Discord" in WinGet. Or when your coworker asks "how do I install VS Code again?" for the fourth time this month.

**For IT Professionals:** Deploy software across your entire network using standardized commands. Use the PC Migration tool to create standard app packages for new computer setups.

**For Developers:** Stop bookmarking package names. Whether you type "chrome," "google chrome," or "that browser thing," WinHub finds what you need instantly.

**For Security-Minded Folks:** Every package comes pre-verified from Microsoft's repository. No more wondering if that "VLC_setup_FINAL_v2.exe" file is legit.

**For PC Builders & System Admins:** Moving to a new machine? Export your current app list and bulk-install everything on your new setup in minutes.

**For Show-Offs:** Install software through PowerShell like some kind of terminal wizard. Your non-tech friends will be impressed, and you'll feel like a hacker *(even though you're literally just copy-pasting commands - they don't need to know that)*.

## How It Works *(Spoiler: It's Easy)*

<div align="center">
    <img src="demos/Demo - Download.gif" alt="WinHub demo showing the search and download process - searching for an application, selecting a version, and copying the WinGet command" width="600">
    <br>
    <em>Search, pick, copy - it's that simple</em>
</div>

1. **Search**: Type whatever you want - "discord," "chrome," "that code editor thing"
2. **Pick**: Browse results with actual useful information
3. **Choose Version**: Select exactly which version you want from the dropdown
4. **Copy Command**: Get the perfect WinGet command, ready to paste
5. **Install**: Drop it in PowerShell and watch the magic happen

**Pro Features:** *(It's free)*
- **Multi-Source Search**: Toggle between WinGet and Chocolatey sources with a single click.
- **Smart Fallbacks**: If an app isn't in the repos, WinHub uses a zero-config scraper to find the official download website instantly.
- **Deep Package Info**: Click any result to see everything - developer, license, official site
- **Exact Match Search**: Know the package ID? Search directly for instant results
- **View Options**: Switch between compact and detailed displays
- **PC Migration**: Export installed apps list, import on another computer for bulk installation
- **Professional UI**: Clean interface you can actually use for hours

## Get WinHub Right Now

### Portable Download (Just Works™)
1. Grab `WinHub-portable-win32-x64.zip` from the [latest release](https://github.com/BaranDev/winhub/releases/latest)
2. Unzip anywhere on your computer
3. Double-click `WinHub.exe` - boom, you're done

**Why Go Portable?** No installer nonsense, no admin privileges required, no registry pollution. When you're done with it *(though you won't be)*, just delete the folder. Clean as a whistle.

### Standalone Executable (Single EXE)
1. Grab `WinHub-Standalone.exe` from the [latest release](https://github.com/BaranDev/winhub/releases/latest)
2. Double-click `WinHub-Standalone.exe` - boom, you're done

**Why Go Standalone?** One file, no dependencies, no fuss. Just download and run it anywhere.

### Build It Yourself (For the Curious)
```bash
git clone https://github.com/BaranDev/winhub
cd winhub
npm install
npm run build
npm start
```

## Create Your Own Distribution

### Creating a Portable Package (Single Folder)

Want to package WinHub yourself? I've got you covered:

```bash
# Clone the repository
git clone https://github.com/BaranDev/winhub
cd winhub

# Install dependencies
npm install

# Build the portable app using electron-builder
npm run portable
```

The `npm run portable` command creates a complete portable package in `release/` - perfect for sharing with your team or keeping on a USB drive.

**What you get:**
- A packaged WinHub app (~70MB) in a single folder
- A fully functional WinHub app ready to run
- No installation required - just run it
- All dependencies bundled inside
- No need for Node.js or npm on the target machine

### Creating a Standalone Executable (Single EXE)

Want to build WinHub from source and create a single standalone .exe file? Here's how:

```bash
# Clone the repository
git clone https://github.com/BaranDev/winhub
cd winhub

# Install dependencies
npm install

# Create single standalone executable
npm run standalone
```

This creates a single `WinHub-Standalone.exe` file in the `release/` folder - one file, no dependencies, just double-click and run. Perfect for sharing or keeping on a USB drive.

**What you get:**
- Single executable file (~65MB) *- that's it, just one file*
- No installation required - just run it
- All dependencies bundled inside
- Ready to share or distribute anywhere

## Requirements

- **OS**: Windows 10/11 (64-bit) *- because it's 2025, who's still on Windows 7?*
- **WinGet / Chocolatey**: Package managers *(don't have WinGet? WinHub will install it for you automatically)*
- **Size**: ~70MB (Portable) or ~65MB (Standalone EXE) *- includes everything you need, yes even Chromium*
- **RAM**: Barely uses any *- seriously, your Discord probably uses more*
- **Admin Rights**: Only needed if you want WinHub to auto-install WinGet for you
- **Internet**: For searching packages *(I mean, obviously)*

**Under the Hood:**
- Built with Electron.js v25.9.8 and React 18.3.1
- Ubuntu Software Center-inspired design *(but actually good)*
- Real-time search with WinGet API integration
- Modern Tailwind CSS styling that doesn't hurt your eyes

## License

This project is licensed under the MIT License - because sharing is caring. See the [LICENSE](LICENSE) file for the full legal text.

**TL;DR:** Do whatever you want with this code. Build something cool, make it better, or just use it as-is. Just don't blame me if something breaks *(though it probably won't, hopefully)*.

---

*Stop downloading random executables from the internet. Your future self (and your IT department) will thank you.*
